export const getAvailableSlots = query({
    args: { organizationId: v.string() },
    handler: async (ctx, args) => {
        const { organizationId } = args;

        const availableSlots = await ctx.db
            .query('availableSlots')
            .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
            .collect();

        return availableSlots;
    },
});