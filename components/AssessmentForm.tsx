"use client";

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useOrganization } from '@clerk/nextjs';
import { Button, Card, CardHeader, CardContent } from '@/components/ui';
import VehicleDetailsForm from './VehicleDetailsForm';
import ServiceSelection from './ServiceSelection';
import VehicleHotspotAssessment from './VehicleHotspotAssessment';
import FileUploadsComponent from './FileUploadsComponent';
import RealTimeSummary from './RealTimeSummary';

export function ComprehensiveAssessmentForm() {
    const { organization } = useOrganization();
    const services = useQuery(api.services.getServices, { organizationId: organization?.id ?? '' });
    const submitAssessment = useMutation(api.assessments.submitAssessment);
    const methods = useForm();
    const [assessmentId, setAssessmentId] = useState(null);

    const onSubmit = async (data) => {
        if (!organization?.id) return;
        const result = await submitAssessment({
            organizationId: organization.id,
            ...data,
        });
        setAssessmentId(result.assessmentId);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>Vehicle Details</CardHeader>
                    <CardContent>
                        <VehicleDetailsForm vehicleDetails={methods.watch('vehicleDetails')} onChange={(data) => methods.setValue('vehicleDetails', data)} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>Vehicle Condition Assessment</CardHeader>
                    <CardContent>
                        <VehicleHotspotAssessment onAssessment={(assessment) => methods.setValue('hotspotAssessment', assessment)} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>Service Selection</CardHeader>
                    <CardContent>
                        <ServiceSelection services={services} onChange={(selectedServices) => methods.setValue('selectedServices', selectedServices)} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>Upload Images/Videos</CardHeader>
                    <CardContent>
                        <FileUploadsComponent />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>Assessment Summary</CardHeader>
                    <CardContent>
                        <RealTimeSummary assessmentId={assessmentId} />
                    </CardContent>
                </Card>

                <Button type="submit">Submit Assessment</Button>
            </form>
        </FormProvider>
    );
}