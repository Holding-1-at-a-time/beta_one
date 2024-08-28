// convex/clients.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: { organizationId: v.string() },
    handler: async (ctx, args) => {
        const clients = await ctx.db
            .query("clients")
            .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
            .collect();
        return clients;
    },
});

export const create = mutation({
    args: {
        organizationId: v.id('organizations'),
        name: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const clientId = await ctx.db.insert("clients", {
            organizationId: args.organizationId,
            name: args.name,
            email: args.email,
            totalInvoices: 0,
            createdAt: new Date().toISOString(),
        });
        return clientId;
    },
});

export const update = mutation({
    args: {
        id: v.id("clients"),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updateFields } = args;
        await ctx.db.patch(id, updateFields);
    },
});

export const remove = mutation({
    args: { id: v.id("clients") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});