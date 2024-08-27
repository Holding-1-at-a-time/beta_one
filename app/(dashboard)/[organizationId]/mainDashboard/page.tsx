// pages/dashboard.tsx
import React from 'react';
import { useOrganization } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import AdminPortal from '../components/AdminPortal';
import SettingsComponent from '../components/SettingsComponent';
import Analytics from '../components/Analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
    const { organization } = useOrganization();
    const organizationData = useQuery(api.organizations.getOrganizationData, {
        organizationId: organization?.id ?? ''
    });

    if (!organizationData) {
        return <div>Loading dashboard...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <Tabs defaultValue="overview">
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <AdminPortal />
                </TabsContent>
                <TabsContent value="analytics">
                    <Analytics />
                </TabsContent>
                <TabsContent value="settings">
                    <SettingsComponent />
                </TabsContent>
            </Tabs>
        </div>
    );
}