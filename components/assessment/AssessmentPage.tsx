import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

export default function AssessmentPage() {
    const params = useParams();
    const organizationId = params?.organizationId as string;
    const tenant = useQuery(api.tenants.getTenantByOrganizationId, { organizationId });
    const [vehicleInfo, setVehicleInfo] = useState({ make: '', model: '', year: '' });
    const submitAssessment = useMutation(api.assessments.submit);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) {
            toast({
                title: "Error",
                description: "Unable to submit assessment. Tenant not found.",
                variant: "destructive",
            });
            return;
        }

        try {
            await submitAssessment({
                tenantId: tenant._id,
                vehicleInfo
            });
            toast({
                title: "Success",
                description: "Assessment submitted successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "An unknown error occurred",
                variant: "destructive",
            });
        }
    };

    if (!tenant) {
        return <div>Loading...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vehicle Assessment for {tenant.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="make">Make</Label>
                            <Input
                                id="make"
                                value={vehicleInfo.make}
                                onChange={(e) => setVehicleInfo({ ...vehicleInfo, make: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="model">Model</Label>
                            <Input
                                id="model"
                                value={vehicleInfo.model}
                                onChange={(e) => setVehicleInfo({ ...vehicleInfo, model: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="year">Year</Label>
                            <Input
                                id="year"
                                type="number"
                                value={vehicleInfo.year}
                                onChange={(e) => setVehicleInfo({ ...vehicleInfo, year: e.target.value })}
                                required
                            />
                        </div>
                        <Button type="submit">Submit Assessment</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}