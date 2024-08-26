// convex/services.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createService = mutation({
    args: {
        organizationId: v.string(),
        name: v.string(),
        description: v.string(),
        basePrice: v.number(),
        priceType: v.union(v.literal("fixed"), v.literal("hourly"), v.literal("variable")),
        customFields: v.array(v.object({
            name: v.string(),
            type: v.union(v.literal("text"), v.literal("number"), v.literal("select"), v.literal("multiselect")),
            options: v.optional(v.array(v.string())),
            affects_price: v.boolean(),
            price_modifier: v.optional(v.number()),
        })),
    },
    handler: async (ctx, args) => {
        const { organizationId } = args;

        // Verify user has permission to create services for this organization
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("Unauthenticated");
        // ... (add more permission checks here)

        const serviceId = await ctx.db.insert("services", args);
        return serviceId;
    },
});

export const updateService = mutation({
    args: {
        serviceId: v.id("services"),
        // ... (include all fields from createService, but make them optional)
    },
    handler: async (ctx, args) => {
        const { serviceId, ...updateFields } = args;

        // Verify user has permission to update this service
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("Unauthenticated");
        // ... (add more permission checks here)

        await ctx.db.patch(serviceId, updateFields);
        return serviceId;
    },
});

export const getServices = query({
    args: { organizationId: v.string() },
    handler: async (ctx, args) => {
        const { organizationId } = args;

        // Verify user has permission to view services for this organization
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("Unauthenticated");
        // ... (add more permission checks here)

        const services = await ctx.db
            .query("services")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
            .collect();

        return services;
    },
});
