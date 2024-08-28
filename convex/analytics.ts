// convex/analytics.ts
import { query, mutation } from './_generated/server';
import { ConvexError, v } from 'convex/values';

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
    args: { organizationId: v.string() },
    handler: async (ctx, args): Promise<AnalyticsData> => {
        const { organizationId } = args;

        // Validate organization access
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new ConvexError('Unauthorized');
        const membership = await ctx.db
            .query('organizationMemberships')
            .withIndex('by_user_org', (q) =>
                q.eq('userId', user.subject).eq('organizationId', organizationId)
            )
            .unique();
        if (!membership) throw new ConvexError('User is not a member of this organization');

        // Fetch data from the database
        const clients = await ctx.db
            .query('clients')
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
        const activeClients = new Set(clients.filter(client => client.isActive).map(client => client._id)).size;
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
                q.eq('userId', user.subject).eq('organizationId', organizationId)
            )
            .unique();
        if (!membership) throw new ConvexError('User is not a member of this organization');

        const { start, end } = getDateRangeFilter(timeRange);

        // Fetch data from the database
        const clients = await ctx.db
            .query('clients')
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

        const newClients = clients.filter(client => new Date(client.createdAt) >= start).length;
        const previousPeriodNewClients = clients.filter(client =>
            new Date(client.createdAt) < start &&
            new Date(client.createdAt) >= new Date(start.getTime() - (end.getTime() - start.getTime()))
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
            const date = client.createdAt.split('T')[0];
            const existingEntry = acc.find(entry => entry.date === date);
            if (existingEntry) {
                if (new Date(client.createdAt) >= start) {
                    existingEntry.newClients++;
                } else {
                    existingEntry.returningClients++;
                }
            } else {
                acc.push({
                    date,
                    newClients: new Date(client.createdAt) >= start ? 1 : 0,
                    returningClients: new Date(client.createdAt) >= start ? 0 : 1
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
            activeClients: clients.filter(client => client.isActive).length,
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
                q.eq('userId', user.subject).eq('organizationId', organizationId)
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

export const getAnalyticsData = query({
    args: { organizationId: v.string() },
    handler: async (ctx, args) => {
        // Fetch assessments for the organization
        const assessments = await ctx.db
            .query('assessments')
            .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
            .collect();

        // Calculate revenue data
        const revenueData = calculateRevenueData(assessments);

        // Calculate service popularity
        const servicePopularity = calculateServicePopularity(assessments);

        // Calculate efficiency data
        const efficiencyData = calculateEfficiencyData(assessments);

        // Calculate service satisfaction
        const serviceSatisfaction = calculateServiceSatisfaction(assessments);

        // Calculate client retention
        const clientRetention = calculateClientRetention(assessments);

        return {
            businessInsights: {
                revenue: revenueData,
                servicePopularity: servicePopularity,
            },
            performanceMetrics: {
                efficiency: efficiencyData,
                serviceSatisfaction: serviceSatisfaction,
            },
            clientReports: {
                clientRetention: clientRetention,
            },
        };
    },
});

// Helper functions

function calculateRevenueData(assessments) {
    const revenueByDate = assessments.reduce((acc, assessment) => {
        const date = assessment.createdAt.split('T')[0];
        acc[date] = (acc[date] || 0) + assessment.estimatedPrice;
        return acc;
    }, {});

    return Object.entries(revenueByDate)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateServicePopularity(assessments) {
    const serviceCounts = assessments.reduce((acc, assessment) => {
        assessment.selectedServices.forEach(service => {
            acc[service.name] = (acc[service.name] || 0) + 1;
        });
        return acc;
    }, {});

    return Object.entries(serviceCounts)
        .map(([service, count]) => ({ service, count }))
        .sort((a, b) => b.count - a.count);
}

function calculateEfficiencyData(assessments) {
    // This is a placeholder calculation. In a real-world scenario, you'd need to
    // define what "efficiency" means for your business and calculate it accordingly.
    return assessments.map(assessment => ({
        date: assessment.createdAt.split('T')[0],
        score: Math.random() * 100, // placeholder random score
    })).sort((a, b) => a.date.localeCompare(b.date));
}

function calculateServiceSatisfaction(assessments) {
    // This assumes you have a rating system in place for each service
    const serviceSatisfaction = assessments.reduce((acc, assessment) => {
        assessment.selectedServices.forEach(service => {
            if (!acc[service.name]) {
                acc[service.name] = { total: 0, count: 0 };
            }
            acc[service.name].total += service.rating || 0;
            acc[service.name].count += 1;
        });
        return acc;
    }, {});

    return Object.entries(serviceSatisfaction)
        .map(([service, data]) => ({
            service,
            score: data.count > 0 ? data.total / data.count : 0,
        }))
        .sort((a, b) => b.score - a.score);
}

function calculateClientRetention(assessments) {
    const clientsByMonth = assessments.reduce((acc, assessment) => {
        const month = assessment.createdAt.substring(0, 7); // YYYY-MM
        if (!acc[month]) {
            acc[month] = { new: new Set(), returning: new Set() };
        }

        const clientId = assessment.clientId;
        if (Object.values(acc).some(monthData => monthData.new.has(clientId) || monthData.returning.has(clientId))) {
            acc[month].returning.add(clientId);
        } else {
            acc[month].new.add(clientId);
        }

        return acc;
    }, {});

    return Object.entries(clientsByMonth)
        .map(([month, data]) => ({
            month,
            newClients: data.new.size,
            returningClients: data.returning.size,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
}