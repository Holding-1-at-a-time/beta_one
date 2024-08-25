import React from 'react';
import { useOrganization } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TenantDashboard() {
    const { organization } = useOrganization();
    const analyticsData = useQuery(api.analytics.getAnalyticsData, { organizationId: organization?.id });
    const recentClients = useQuery(api.clients.getRecentClients, { organizationId: organization?.id });
    const recentInvoices = useQuery(api.invoices.getRecentInvoices, { organizationId: organization?.id });

    if (!analyticsData || !recentClients || !recentInvoices) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <Button>Add New Client</Button>
            </header>
            <main className="flex-1 p-6 bg-background">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard title="Total Revenue" value={`$${analyticsData.totalRevenue.toFixed(2)}`} />
                    <MetricCard title="Active Clients" value={analyticsData.activeClients} />
                    <MetricCard title="Pending Invoices" value={analyticsData.pendingInvoices} />
                    <MetricCard title="Completed Jobs" value={analyticsData.completedJobs} />
                </div>
                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analyticsData.revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Clients</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Date Added</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentClients.map((client) => (
                                        <TableRow key={client.id}>
                                            <TableCell>{client.name}</TableCell>
                                            <TableCell>{client.email}</TableCell>
                                            <TableCell>{new Date(client.dateAdded).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentInvoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell>{invoice.invoiceNumber}</TableCell>
                                            <TableCell>{invoice.clientName}</TableCell>
                                            <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant={invoice.status === 'Paid' ? 'success' : 'warning'}>
                                                    {invoice.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

function MetricCard({ title, value }) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-muted-foreground">{title}</p>
            </CardContent>
        </Card>
    );
}