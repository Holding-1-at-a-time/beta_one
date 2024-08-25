import React from 'react';
import { useOrganization, useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import Image from "next/image";

export default function TenantDashboard() {
    const { organization } = useOrganization();
    const { user } = useUser();
    const generateQRCode = useMutation(api.tenants.generateQRCode);
    const tenant = useQuery(api.tenants.getTenantByOrganizationId, {
        organizationId: organization?.id ?? ''
    });

    const handleGenerateQRCode = async () => {
        if (!organization || !user) {
            toast({
                title: "Error",
                description: "Unable to generate QR code. Please try again.",
                variant: "destructive",
            });
            return;
        }

        try {
            await generateQRCode({
                name: organization.name ?? 'Unknown Organization',
                organizationId: organization.id
            });
            toast({
                title: "Success",
                description: "QR code generated successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "An unknown error occurred",
                variant: "destructive",
            });
        }
    };

    if (!organization || !user) {
        return (
            <Alert>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Unable to load organization or user data.</AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tenant Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Organization: {organization.name}</p>
                <p>User: {user.fullName}</p>
                {tenant ? (
                    <div>
                        <p>QR Code:</p>
                        <Image src={tenant.qrCodeUrl} alt="Tenant QR Code" />
                    </div>
                ) : (
                    <Button onClick={handleGenerateQRCode}>Generate QR Code</Button>
                )}
            </CardContent>
        </Card>
    );
}