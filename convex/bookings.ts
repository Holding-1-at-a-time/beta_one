import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBookingDetails = query({
    args: { bookingId: v.string() },
    handler: async (ctx, args) => {
        const { bookingId } = args;

        const booking = await ctx.db.get(bookingId as Id<'bookings'>);

        if (!booking) {
            throw new Error('Booking not found');
        }

        return booking;
    },
});

export const sendConfirmationEmail = mutation({
    args: { bookingId: v.string() },
    handler: async (ctx, args) => {
        const { bookingId } = args;

        const booking = await ctx.db.get(bookingId as Id<'bookings'>);

        if (!booking) {
            throw new Error('Booking not found');
        }

        // Implement email sending logic here
        // For example, you might use a third-party email service

        return { success: true };
    },
});

export const updateBookingStatus = mutation({
    args: {
        bookingId: v.id("bookings"),
        status: v.union(v.literal("confirmed"), v.literal("cancelled"), v.literal("completed"), v.literal("pending")),
    },
    handler: async (ctx, args) => {
        const { bookingId, status } = args;

        const user = await ctx.auth.getUserIdentity();
        if (!user) {
            throw new Error("Unauthenticated");
        }

        const booking = await ctx.db.get(bookingId);
        if (!booking) {
            throw new Error("Booking not found");
        }

        const hasPermission = await checkUserPermission(ctx, booking.organizationId, UserRole.Staff);
        if (!hasPermission) {
            throw new Error("Unauthorized");
        }

        await ctx.db.runTransaction(async (tx) => {
            await tx.patch(bookingId, {
                status,
                updatedAt: Date.now(),
            });

            if (status === "cancelled") {
                await tx.patch(booking.appointmentId, {
                    status: "available",
                });
            }
        });

        await logAuditEvent(
            ctx,
            booking.organizationId,
            user.subject,
            "update_booking_status",
            "bookings",
            bookingId,
            `Updated booking status to ${status}`
        );

        return { success: true };
    },
});

export const cancelBooking = mutation({
    args: {
        bookingId: v.id("bookings"),
    },
    handler: async (ctx, args) => {
        const { bookingId } = args;

        const user = await ctx.auth.getUserIdentity();
        if (!user) {
            throw new Error("Unauthenticated");
        }

        const booking = await ctx.db.get(bookingId);
        if (!booking) {
            throw new Error("Booking not found");
        }

        const hasPermission = await checkUserPermission(ctx, booking.organizationId, UserRole.Customer);
        if (!hasPermission) {
            throw new Error("Unauthorized");
        }

        const appointment = await ctx.db.get(booking.appointmentId);
        if (!appointment) {
            throw new Error("Associated appointment not found");
        }

        const currentTime = Date.now();
        const cancellationDeadline = appointment.startTime - 24 * 60 * 60 * 1000; // 24 hours before appointment

        if (currentTime > cancellationDeadline) {
            throw new Error("Cancellation is not allowed within 24 hours of the appointment");
        }

        await ctx.db.runTransaction(async (tx) => {
            await tx.patch(bookingId, {
                status: "cancelled",
                updatedAt: currentTime,
            });

            await tx.patch(booking.appointmentId, {
                status: "available",
            });
        });

        await logAuditEvent(
            ctx,
            booking.organizationId,
            user.subject,
            "cancel_booking",
            "bookings",
            bookingId,
            "Booking cancelled"
        );

        // Here you would trigger a notification to the organization about the cancellation

        return { success: true };
    },
});

// Implement rate limiting
const RATE_LIMIT = 100; // requests per minute
const rateLimitStore: { [key: string]: number[] } = {};

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userRequests = rateLimitStore[userId] || [];
    const recentRequests = userRequests.filter((timestamp) => now - timestamp < 60000);

    if (recentRequests.length >= RATE_LIMIT) {
        return false;
    }

    rateLimitStore[userId] = [...recentRequests, now];
    return true;
}

// Wrap mutations with rate limiting
const wrapWithRateLimit = (mutation: any) => {
    return async (ctx: any, args: any) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) {
            throw new Error("Unauthenticated");
        }

        if (!checkRateLimit(user.subject)) {
            throw new Error("Rate limit exceeded");
        }

        return mutation(ctx, args);
    };
};

export const createAvailableSlotsWithRateLimit = wrapWithRateLimit(createAvailableSlots);
export const updateBookingStatusWithRateLimit = wrapWithRateLimit(updateBookingStatus);
export const cancelBookingWithRateLimit = wrapWithRateLimit(cancelBooking);

// Implement caching
import { caching } from "./utils/caching";

export const getAvailableSlots = caching(query({
    args: {
        organizationId: v.id('organizations'),
        startDate: v.number(),
        endDate: v.number(),
        page: v.number(),
        pageSize: v.number(),
    },
    handler: async (ctx, args) => {
        const { organizationId, startDate, endDate, page, pageSize } = args;

        const slots = await ctx.db
            .query("availableSlots")
            .withIndex("by_time", (q) =>
                q.eq("organizationId", organizationId)
                    .gte("startTime", startDate)
                    .lt("startTime", endDate)
            )
            .order("asc")
            .paginate({ page, pageSize });

        return slots;
    },
}), { ttl: 60 }); // Cache for 60 seconds