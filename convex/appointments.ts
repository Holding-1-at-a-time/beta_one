// convex/appointments.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { AppointmentStatus } from "@/types/appointment";


export const getAppointments = query({
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


export const listByOrganization = query({
    args: { organizationId: v.string() },
    handler: async (ctx, args) => {
        const appointments = await ctx.db
            .query("appointments")
            .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
            .order("desc")
            .collect();
        return appointments;
    },
});

export const create = mutation({
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
            status: "Scheduled",
            createdAt: new Date().toISOString(),
        });
        return appointmentId;
    },
});

export const update = mutation({
    args: {
        id: v.id("appointments"),
        service: v.optional(v.string()),
        date: v.optional(v.string()),
        notes: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updateFields } = args;
        await ctx.db.patch(id, updateFields);
    },
});

export const cancel = mutation({
    args: { id: v.id("appointments") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: "Cancelled" });
    },
});

export const listByOrganization = query({
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

export const create = mutation({
    args: {
        organizationId: v.id('organizations'),
        customer: v.string(),
        service: v.string(),
        date: v.string(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { organizationId, customer, service, date, notes } = args;

        const user = await ctx.auth.getUserIdentity();
        if (!user) {
            throw new Error("Unauthenticated");
        }

        const appointmentId = await ctx.db.insert("appointments", {
            organizationId,
            customer,
            service,
            date,
            notes,
            status: "scheduled" as AppointmentStatus,
            createdBy: user.subject,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return appointmentId;
    },
});

export const update = mutation({
    args: {
        id: v.id("appointments"),
        customer: v.optional(v.string()),
        service: v.optional(v.string()),
        date: v.optional(v.string()),
        notes: v.optional(v.string()),
        status: v.optional(v.union(v.literal("scheduled"), v.literal("completed"), v.literal("cancelled"))),
    },
    handler: async (ctx, args) => {
        const { id, ...updateFields } = args;

        const user = await ctx.auth.getUserIdentity();
        if (!user) {
            throw new Error("Unauthenticated");
        }

        const appointment = await ctx.db.get(id);
        if (!appointment) {
            throw new Error("Appointment not found");
        }

        const userRoles = await ctx.auth.getUserRoles(user.subject);
        const isAdmin = userRoles.includes("admin");
        const isOrganizationAdmin = userRoles.includes("organization-admin");
        const isServiceTechnician = userRoles.includes("service-technician");
        const isServiceTechnicianOfTheAppointment = appointment.serviceTechnician === user.subject;

        if (!isAdmin && !isOrganizationAdmin && !isServiceTechnician && !isServiceTechnicianOfTheAppointment) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(id, {
            ...updateFields,
            updatedAt: new Date().toISOString(),
        });
    },
});

export const cancel = mutation({
    args: { id: v.id("appointments") },
    handler: async (ctx, args) => {
        const { id } = args;

        const user = await ctx.auth.getUserIdentity();
        if (!user) {
            throw new Error("Unauthenticated");
        }

        const appointment = await ctx.db.get(id);
        if (!appointment) {
            throw new Error("Appointment not found");
        }

        const userRoles = await ctx.auth.getUserRoles(user.subject);
        const isAdmin = userRoles.includes("admin");
        const isOrganizationAdmin = userRoles.includes("organization-admin");
        const isServiceTechnician = userRoles.includes("service-technician");
        const isServiceTechnicianOfTheAppointment = appointment.serviceTechnician === user.subject;

        if (!isAdmin && !isOrganizationAdmin && !isServiceTechnician && !isServiceTechnicianOfTheAppointment) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(id, {
            status: "cancelled" as AppointmentStatus,
            updatedAt: new Date().toISOString(),
        });
    },
});