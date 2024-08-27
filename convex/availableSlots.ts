// availableSlots.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkUserPermission, UserRole } from "./utils/permissions";
import { appointmentSchema } from "./utils/validation";
import { logAuditEvent } from "./utils/logging";

export const createAvailableSlots = mutation({
    args: {
        organizationId: v.string(),
        slots: v.array(
            v.object({
                startTime: v.number(),
                endTime: v.number(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const { organizationId, slots } = args;

        const user = await ctx.auth.getUserIdentity();
        if (!user) {
            throw new Error("Unauthenticated");
        }

        const hasPermission = await checkUserPermission(ctx, organizationId, UserRole.Staff);
        if (!hasPermission) {
            throw new Error("Unauthorized");
        }

        const createdSlots: Id<"availableSlots">[] = [];

        await ctx.db.runTransaction(async (tx) => {
            for (const slot of slots) {
                const validatedSlot = appointmentSchema.parse({
                    organizationId,
                    ...slot,
                    status: "available",
                });

                const existingSlot = await tx
                    .query("availableSlots")
                    .withIndex("by_time", (q) =>
                        q
                            .eq("organizationId", organizationId)
                            .gte("startTime", validatedSlot.startTime)
                            .lt("startTime", validatedSlot.endTime)
                    )
                    .first();

                if (existingSlot) {
                    throw new Error(`Overlapping slot found at ${new Date(validatedSlot.startTime).toISOString()}`);
                }

                const slotId = await tx.insert("availableSlots", {
                    ...validatedSlot,
                    createdAt: Date.now(),
                });

                createdSlots.push(slotId);
            }
        });

        await logAuditEvent(
            ctx,
            organizationId,
            user.subject,
            "create_available_slots",
            "availableSlots",
            createdSlots.join(","),
            `Created ${createdSlots.length} available slots`
        );

        return createdSlots;
    },
});