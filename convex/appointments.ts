export const getAppointments = query({
    args: {
        organizationId: v.string(),
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
