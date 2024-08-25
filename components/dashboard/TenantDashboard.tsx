import React from 'react';
import { useOrganization, useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import Image from "nextjs/image";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function TenantDashboard() {
    const { organization, isLoaded: orgIsLoaded } = useOrganization();
    const { user, isLoaded: userIsLoaded } = useUser();
    const generateOrUpdateQRCode = useMutation(api.tenants.generateOrUpdateQRCode);
    const tenant = useQuery(api.tenants.getTenantByOrganizationId, {
        organizationId: organization?.id ?? ''
    });

    const handleGenerateQRCode = async () => {
        if (!organization || !user) {
            toast({
                title: "Error",
                description: "Unable to generate QR code. Organization or user data is missing.",
                variant: "destructive",
            });
            return;
        }

        try {
            await generateOrUpdateQRCode({
                name: organization.name ?? 'Unknown Organization',
                organizationId: organization.id,
                contactEmail: user.primaryEmailAddress?.emailAddress ?? '',
                contactPhone: user.primaryPhoneNumber?.phoneNumber,
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

    if (!orgIsLoaded || !userIsLoaded) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!organization || !user) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Unable to load organization or user data.</AlertDescription>
            </Alert>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Tenant Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold">Organization</h3>
                        <p>{organization.name}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">User</h3>
                        <p>{user.fullName}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Email</h3>
                        <p>{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Phone</h3>
                        <p>{user.primaryPhoneNumber?.phoneNumber ?? 'Not provided'}</p>
                    </div>
                </div>
                {tenant ? (
                    <div className="mt-6">
                        <h3 className="font-semibold mb-2">QR Code</h3>
                        <Image src={tenant.qrCodeUrl} alt="Tenant QR Code" className="max-w-full h-auto" />
                        <p className="mt-2 text-sm text-gray-500">Last updated: {new Date(tenant.updatedAt).toLocaleString()}</p>
                    </div>
                ) : (
                    <Button onClick={handleGenerateQRCode} className="w-full mt-4">
                        Generate QR Code
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}