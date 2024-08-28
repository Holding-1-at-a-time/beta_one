// convex/settings.ts
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getSettings = query({
    args: { organizationId: v.string() },
    handler: async (ctx, args) => {
        const settings = await ctx.db
            .query('settings')
            .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
            .unique();

        if (!settings) {
            // Return default settings if not found
            return {
                companyName: '',
                companyAddress: '',
                companyPhone: '',
                enableAIRecommendations: true,
                defaultServiceTime: 60,
                priceCalculationMethod: 'fixed',
                notifyNewAssessments: true,
                notifyAssessmentUpdates: true,
                notifyDailySummary: false,
                stripeConnected: false,
                googleCalendarConnected: false,
                quickBooksConnected: false,
            };
        }

        return settings;
    },
});

export const updateSettings = mutation({
    args: {
        organizationId: v.id('organizations'),
        companyName: v.optional(v.string()),
        companyAddress: v.optional(v.string()),
        companyPhone: v.optional(v.string()),
        enableAIRecommendations: v.optional(v.boolean()),
        defaultServiceTime: v.optional(v.number()),
        priceCalculationMethod: v.optional(v.union(v.literal('fixed'), v.literal('hourly'), v.literal('variable'))),
        notifyNewAssessments: v.optional(v.boolean()),
        notifyAssessmentUpdates: v.optional(v.boolean()),
        notifyDailySummary: v.optional(v.boolean()),
        stripeConnected: v.optional(v.boolean()),
        googleCalendarConnected: v.optional(v.boolean()),
        quickBooksConnected: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { organizationId, ...updateData } = args;

        const existingSettings = await ctx.db
            .query('settings')
            .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
            .unique();

        if (existingSettings) {
            await ctx.db.patch(existingSettings._id, updateData);
        } else {
            await ctx.db.insert('settings', { organizationId, ...updateData });
        }

        return { success: true };
    },
});