// convex/organizations.ts
import { query } from './_generated/server';
import { v } from 'convex/values';

export const getOrganizationData = query({
    args: { organizationId: v.string() },
    handler: async (ctx, args) => {
        const organization = await ctx.db
            .query('organizations')
            .withIndex('by_id', (q) => q.eq('_id', args.organizationId))
            .unique();

        if (!organization) {
            throw new Error('Organization not found');
        }

        return organization;
    },
});