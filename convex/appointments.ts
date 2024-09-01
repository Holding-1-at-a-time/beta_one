// convex/appointments.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { AppointmentStatus } from "./types/appointment";

export const getAppointments = query<{
    organizationId: Id;
    page?: number;
    pageSize?: number;
}, Appointment[]>({
    args: {
        organizationId: v.id('organizations'),
        page: v.optional(v.number()),
        pageSize: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { organizationId, page = 1, pageSize = 10 } = args;

        const appointments = await ctx.db
            .query('appointments')
            .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
            .order('desc')
            .paginate({ page, pageSize });

        return appointments.items;
    },
});

export const listByOrganization = query<{
    organizationId: Id;
}, Appointment[]>({
    args: {
        organizationId: v.id('organizations'),
    },
    handler: async (ctx, args) => {
        const appointments = await ctx.db
            .query("appointments")
            .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
            .order("desc")
            .collect();
        return appointments;
    },
});

export const create = mutation<{
    organizationId: Id;
    clientId: Id;
    service: string;
    date: string;
    notes?: string;
}, Id>({
    args: {
        organizationId: v.id('organizations'),
        clientId: v.id("clients"),
        service: v.string(),
        date: v.string(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const appointmentId = await ctx.db.insert("appointments", {
            organizationId: args.organizationId,
            clientId: args.clientId,
            service: args.service,
            date: args.date,
            notes: args.notes,
            status: "Scheduled" as AppointmentStatus,
            createdAt: new Date().toISOString(),
        });
        return appointmentId;
    },
});

export const update = mutation<{
    id: Id;
    service?: string;
    date?: string;
    notes?: string;
    status?: AppointmentStatus;
}, void>({
    args: {
        id: v.id("appointments"),
        service: v.optional(v.string()),
        date: v.optional(v.string()),
        notes: v.optional(v.string()),
        status: v.optional(v.union(
            v.literal("Scheduled"),
            v.literal("Completed"),
            v.literal("Cancelled")
        )),
    },
    handler: async (ctx, args) => {
        const { id, ...updateFields } = args;
        await ctx.db.patch(id, updateFields);
    },
});

export const cancel = mutation<{
    id: Id;
}, void>({
    args: {
        id: v.id("appointments"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: "Cancelled" as AppointmentStatus });
    },
});

export const listByOrganizationAndDate = query<{
    organizationId: Id;
    startDate: string;
    endDate: string;
    page: number;
    pageSize: number;
}, Appointments[]>({
    args: {
        organizationId: v.id('organizations'),
        startDate: v.string(),
        endDate: v.string(),
        page: v.number(),
        pageSize: v.number(),
    },
    handler: async (ctx, args) => {
        const { organizationId, startDate, endDate, page, pageSize } = args;

        const appointments = await ctx.db
            .query("appointments")
            .withIndex("by_organization_and_date", (q) =>
                q.eq("organizationId", organizationId)
                .gte("date", startDate)
                .lt("date", endDate)
            )
            .order("desc")
            .paginate({ page, pageSize });

        return appointments;
    },
});