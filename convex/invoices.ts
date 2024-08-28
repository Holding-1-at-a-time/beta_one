// convex/invoices.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const list = query({
    args: { organizationId: v.string() },
    handler: async (ctx, args) => {
        const invoices = await ctx.db
            .query("invoices")
            .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
            .order("desc")
            .collect();
        return invoices;
    },
});

export const create = mutation({
    args: {
        organizationId: v.id('organizations'),
        clientId: v.id("clients"),
        amount: v.number(),
        dueDate: v.string(),
    },
    handler: async (ctx, args) => {
        const invoiceId = await ctx.db.insert("invoices", {
            organizationId: args.organizationId,
            clientId: args.clientId,
            amount: args.amount,
            status: "Pending",
            dueDate: args.dueDate,
            createdAt: new Date().toISOString(),
        });

        // Update client's total invoices
        const client = await ctx.db.get(args.clientId);
        if (client) {
            await ctx.db.patch(args.clientId, {
                totalInvoices: (client.totalInvoices || 0) + args.amount,
            });
        }

        return invoiceId;
    },
});

export const update = mutation({
    args: {
        id: v.id("invoices"),
        amount: v.optional(v.number()),
        status: v.optional(v.string()),
        dueDate: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updateFields } = args;
        await ctx.db.patch(id, updateFields);
    },
});