// convex/analytics.ts
import { query, mutation } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { Id } from './_generated/dataModel';

// Type definitions
type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year';

interface AnalyticsData {
    totalRevenue: number;
    activeClients: number;
    pendingInvoices: number;
    completedJobs: number;
    revenueData: Array<{ date: string; revenue: number }>;
}

interface DetailedAnalyticsData extends AnalyticsData {
    revenueTrend: number;
    newClients: number;
    clientsTrend: number;
    averageJobValue: number;
    jobValueTrend: number;
    customerSatisfaction: number;
    satisfactionTrend: number;
    servicesBreakdown: Array<{ name: string; value: number }>;
    clientAcquisitionRetention: Array<{ date: string; newClients: number; returningClients: number }>;
    topPerformingServices: Array<{ name: string; revenue: number; growth: number }>;
    customerFeedback: Array<{ rating: number; count: number }>;
}

// Helper functions
const calculateTrend = (current: number, previous: number): number => {
    return previous !== 0 ? ((current - previous) / previous) * 100 : 0;
};

const getDateRangeFilter = (timeRange: TimeRange): { start: Date; end: Date } => {
    const end = new Date();
    let start = new Date();
    switch (timeRange) {
        case 'day':
            start.setDate(end.getDate() - 1);
            break;
        case 'week':
            start.setDate(end.getDate() - 7);
            break;
        case 'month':
            start.setMonth(end.getMonth() - 1);
            break;
        case 'quarter':
            start.setMonth(end.getMonth() - 3);
            break;
        case 'year':
            start.setFullYear(end.getFullYear() - 1);
            break;
    }
    return { start, end };
};

// Queries
export const getAnalyticsData = query({
    args: { organizationId: v.id('organizations') },
    handler: async (ctx, args): Promise<AnalyticsData> => {
        const { organizationId } = args;

        // Validate organization access
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new ConvexError('Unauthorized');
        const membership = await ctx.db
            .query('organizationMemberships')
            .withIndex('by_user_org', (q) =>
                q.eq('userId', user.subject as Id<"users">).eq('organizationId', organizationId)
            )
            .unique();
        if (!membership) throw new ConvexError('User is not a member of this organization');

        // Fetch data from the database
        const clients = await ctx.db
            .query('users')
            .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
            .collect();

        const invoices = await ctx.db
            .query('invoices')
            .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
            .collect();

        const jobs = await ctx.db
            .query('jobs')
            .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
            .collect();

        // Calculate metrics
        const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
        const activeClients = clients.filter(client => client.role !== 'non-member').length;
        const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending').length;
        const completedJobs = jobs.filter(job => job.status === 'completed').length;

        // Generate revenue data for the last 6 months
        const revenueData = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const revenue = invoices
                .filter(invoice => invoice.date.startsWith(monthYear))
                .reduce((sum, invoice) => sum + invoice.amount, 0);
            return { date: monthYear, revenue };
        }).reverse();

        return {
            totalRevenue,
            activeClients,
            pendingInvoices,
            completedJobs,
            revenueData,
        };
    },
});

export const getDetailedAnalyticsData = query({
    args: {
        organizationId: v.id('organizations'),
        timeRange: v.union(v.literal('day'), v.literal('week'), v.literal('month'), v.literal('quarter'), v.literal('year'))
    },
    handler: async (ctx, args): Promise<DetailedAnalyticsData> => {
        const { organizationId, timeRange } = args;

        // Validate organization access
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new ConvexError('Unauthorized');
        const membership = await ctx.db
            .query('organizationMemberships')
            .withIndex('by_user_org', (q) =>
                q.eq('userId', user.subject as Id<"users">).eq('organizationId', organizationId)
            )
            .unique();
        if (!membership) throw new ConvexError('User is not a member of this organization');

        const { start, end } = getDateRangeFilter(timeRange);

        // Fetch data from the database
        const clients = await ctx.db
            .query('users')
            .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
            .collect();

        const invoices = await ctx.db
            .query('invoices')
            .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
            .filter(q => q.gte(q.field('date'), start.toISOString().split('T')[0]))
            .collect();

        const jobs = await ctx.db
            .query('jobs')
            .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
            .filter(q => q.gte(q.field('date'), start.toISOString().split('T')[0]))
            .collect();

        const feedbacks = await ctx.db
            .query('feedbacks')
            .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
            .filter(q => q.gte(q.field('date'), start.toISOString().split('T')[0]))
            .collect();

        // Calculate metrics
        const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
        const previousPeriodRevenue = invoices
            .filter(invoice => new Date(invoice.date) < start)
            .reduce((sum, invoice) => sum + invoice.amount, 0);
        const revenueTrend = calculateTrend(totalRevenue, previousPeriodRevenue);

        const newClients = clients.filter(client => new Date(client.createdAt as string) >= start).length;
        const previousPeriodNewClients = clients.filter(client =>
            new Date(client.createdAt as string) < start &&
            new Date(client.createdAt as string) >= new Date(start.getTime() - (end.getTime() - start.getTime()))
        ).length;
        const clientsTrend = calculateTrend(newClients, previousPeriodNewClients);

        const averageJobValue = jobs.length > 0 ? totalRevenue / jobs.length : 0;
        const previousAverageJobValue = jobs
            .filter(job => new Date(job.date) < start)
            .reduce((sum, job) => sum + job.amount, 0) / jobs.filter(job => new Date(job.date) < start).length;
        const jobValueTrend = calculateTrend(averageJobValue, previousAverageJobValue);

        const customerSatisfaction = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length;
        const previousSatisfaction = feedbacks
            .filter(feedback => new Date(feedback.date) < start)
            .reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.filter(feedback => new Date(feedback.date) < start).length;
        const satisfactionTrend = calculateTrend(customerSatisfaction, previousSatisfaction);

        // Generate detailed data
        const revenueOverTime = invoices.reduce((acc, invoice) => {
            const date = invoice.date.split('T')[0];
            const existingEntry = acc.find(entry => entry.date === date);
            if (existingEntry) {
                existingEntry.revenue += invoice.amount;
            } else {
                acc.push({ date, revenue: invoice.amount });
            }
            return acc;
        }, [] as Array<{ date: string; revenue: number }>).sort((a, b) => a.date.localeCompare(b.date));

        const servicesBreakdown = jobs.reduce((acc, job) => {
            const existingEntry = acc.find(entry => entry.name === job.serviceName);
            if (existingEntry) {
                existingEntry.value += job.amount;
            } else {
                acc.push({ name: job.serviceName, value: job.amount });
            }
            return acc;
        }, [] as Array<{ name: string; value: number }>);

        const clientAcquisitionRetention = clients.reduce((acc, client) => {
            const date = (client.createdAt as string).split('T')[0];
            const existingEntry = acc.find(entry => entry.date === date);
            if (existingEntry) {
                if (new Date(client.createdAt as string) >= start) {
                    existingEntry.newClients++;
                } else {
                    existingEntry.returningClients++;
                }
            } else {
                acc.push({
                    date,
                    newClients: new Date(client.createdAt as string) >= start ? 1 : 0,
                    returningClients: new Date(client.createdAt as string) >= start ? 0 : 1
                });
            }
            return acc;
        }, [] as Array<{ date: string; newClients: number; returningClients: number }>).sort((a, b) => a.date.localeCompare(b.date));

        const topPerformingServices = Object.entries(jobs.reduce((acc, job) => {
            acc[job.serviceName] = (acc[job.serviceName] || 0) + job.amount;
            return acc;
        }, {} as Record<string, number>))
            .map(([name, revenue]) => ({
                name,
                revenue,
                growth: calculateTrend(
                    jobs.filter(j => j.serviceName === name && new Date(j.date) >= start).reduce((sum, j) => sum + j.amount, 0),
                    jobs.filter(j => j.serviceName === name && new Date(j.date) < start).reduce((sum, j) => sum + j.amount, 0)
                )
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const customerFeedback = feedbacks.reduce((acc, feedback) => {
            const rating = Math.round(feedback.rating);
            acc[rating] = (acc[rating] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        return {
            totalRevenue,
            revenueTrend,
            newClients,
            clientsTrend,
            averageJobValue,
            jobValueTrend,
            customerSatisfaction,
            satisfactionTrend,
            activeClients: clients.filter(client => client.role !== 'non-member').length,
            pendingInvoices: invoices.filter(invoice => invoice.status === 'pending').length,
            completedJobs: jobs.filter(job => job.status === 'completed').length,
            revenueData: revenueOverTime,
            servicesBreakdown,
            clientAcquisitionRetention,
            topPerformingServices,
            customerFeedback: Object.entries(customerFeedback).map(([rating, count]) => ({ rating: Number(rating), count })),
        };
    },
});

// Mutation for caching analytics data
export const cacheAnalyticsData = mutation({
    args: {
        organizationId: v.id('organizations'),
        timeRange: v.union(v.literal('day'), v.literal('week'), v.literal('month'), v.literal('quarter'), v.literal('year')),
        data: v.object({
            totalRevenue: v.number(),
            revenueTrend: v.number(),
            newClients: v.number(),
            clientsTrend: v.number(),
            averageJobValue: v.number(),
            jobValueTrend: v.number(),
            customerSatisfaction: v.number(),
            satisfactionTrend: v.number(),
            activeClients: v.number(),
            pendingInvoices: v.number(),
            completedJobs: v.number(),
            revenueData: v.array(v.object({ date: v.string(), revenue: v.number() })),
            servicesBreakdown: v.array(v.object({ name: v.string(), value: v.number() })),
            clientAcquisitionRetention: v.array(v.object({ date: v.string(), newClients: v.number(), returningClients: v.number() })),
            topPerformingServices: v.array(v.object({ name: v.string(), revenue: v.number(), growth: v.number() })),
            customerFeedback: v.array(v.object({ rating: v.number(), count: v.number() })),
        }),
    },
    handler: async (ctx, args) => {
        const { organizationId, timeRange, data } = args;

        // Validate organization access
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new ConvexError('Unauthorized');
        const membership = await ctx.db
            .query('organizationMemberships')
            .withIndex('by_user_org', (q) =>
                q.eq('userId', user.subject as Id<"users">).eq('organizationId', organizationId)
            )
            .unique();
        if (!membership) throw new ConvexError('User is not a member of this organization');

        // Store the cached data
        await ctx.db.insert('analyticsCache', {
            organizationId,
            timeRange,
            data,
            timestamp: new Date().toISOString(),
        });
    },
});