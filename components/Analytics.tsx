
import React from 'react';
import { useOrganization } from '@clerk/nextjs';
import { api } from '../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery, useMutation } from 'convex/react';

export default function ComprehensiveAnalytics() {
    const { organization } = useOrganization();
    const [timeRange, setTimeRange] = React.useState('month');
    const { organization } = useOrganization();
    const analyticsData = useQuery(api.analytics.getAnalyticsData, {
        organizationId: organization?.id ?? ''
    });
    const detailedAnalyticsData = useQuery(api.analytics.getDetailedAnalyticsData, {
        organizationId: organization?.id ?? '',
        timeRange: 'month'
    });

    const cacheAnalytics = useMutation(api.analytics.cacheAnalyticsData);
    const analyticsData = useQuery(api.analytics.getDetailedAnalyticsData, {
        organizationId: organization?.id,
        timeRange
    });

    if (!analyticsData) {
        return <div>Loading...</div>;
    }
    

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Analytics</h1>
                <div className="flex items-center gap-4">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Last Week</SelectItem>
                            <SelectItem value="month">Last Month</SelectItem>
                            <SelectItem value="quarter">Last Quarter</SelectItem>
                            <SelectItem value="year">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button>Export Report</Button>
                </div>
            </header>
            <main className="flex-1 p-6 bg-background">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard title="Total Revenue" value={`$${analyticsData.totalRevenue.toFixed(2)}`} trend={analyticsData.revenueTrend} />
                    <MetricCard title="New Clients" value={analyticsData.newClients} trend={analyticsData.clientsTrend} />
                    <MetricCard title="Average Job Value" value={`$${analyticsData.averageJobValue.toFixed(2)}`} trend={analyticsData.jobValueTrend} />
                    <MetricCard title="Customer Satisfaction" value={`${analyticsData.customerSatisfaction.toFixed(1)}/5`} trend={analyticsData.satisfactionTrend} />
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Over Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={analyticsData.revenueOverTime}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Services Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie dataKey="value" data={analyticsData.servicesBreakdown} fill="#8884d8" label />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Acquisition and Retention</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analyticsData.clientAcquisitionRetention}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="newClients" fill="#8884d8" />
                                    <Bar dataKey="returningClients" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Performing Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Revenue</TableHead>
                                        <TableHead>Growth</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analyticsData.topPerformingServices.map((service) => (
                                        <TableRow key={service.name}>
                                            <TableCell>{service.name}</TableCell>
                                            <TableCell>${service.revenue.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <TrendIndicator value={service.growth} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Feedback Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analyticsData.customerFeedback}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="rating" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

function MetricCard({ title, value, trend }) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-muted-foreground">{title}</p>
                        <div className="text-2xl font-bold">{value}</div>
                    </div>
                    <TrendIndicator value={trend} />
                </div>
            </CardContent>
        </Card>
    );
}

function TrendIndicator({ value }) {
    const color = value >= 0 ? 'text-green-500' : 'text-red-500';
    const Icon = value >= 0 ? ArrowUpIcon : ArrowDownIcon;
    return (
        <div className={`flex items-center ${color}`}>
            <Icon className="w-4 h-4 mr-1" />
            {Math.abs(value)}%
        </div>
    );
}

function ArrowUpIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m5 12 7-7 7 7" />
            <path d="M12 19V5" />
        </svg>
    )
}

function ArrowDownIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
        </svg>
    )
}