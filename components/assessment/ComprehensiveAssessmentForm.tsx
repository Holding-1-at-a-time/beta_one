'use client';
 
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useOrganization, useUser } from '@clerk/nextjs';
import { Button, Card, CardHeader, CardContent, Input, Label, Select, Textarea, Toast } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import VehicleHotspotAssessment from './VehicleHotspotAssessment';
import FileUploadsComponent from './FileUploadsComponent';
import RealTimeSummary from './RealTimeSummary';

const vehicleSchema = z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    vin: z.string().optional(),
});

const serviceSchema = z.object({
    serviceId: z.string(),
    quantity: z.number().int().min(1),
    customFields: z.array(z.object({
        name: z.string(),
        value: z.union([z.string(), z.number()]),
    })),
});

const assessmentSchema = z.object({
    vehicleDetails: vehicleSchema,
    selectedServices: z.array(serviceSchema),
    hotspotAssessment: z.array(z.object({
        part: z.string(),
        issue: z.string(),
    })),
    mediaFiles: z.array(z.object({
        url: z.string().url(),
        type: z.string(),
        name: z.string(),
    })),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

export function ComprehensiveAssessmentForm() {
    const { organization } = useOrganization();
    const { user } = useUser();
    const services = useQuery(api.services.getServices, { organizationId: organization?.id ?? '' });
    const submitAssessment = useMutation(api.assessments.submitAssessment);
    const [assessmentId, setAssessmentId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const methods = useForm<AssessmentFormData>({
        resolver: zodResolver(assessmentSchema),
        defaultValues: {
            vehicleDetails: { make: '', model: '', year: new Date().getFullYear(), vin: '' },
            selectedServices: [],
            hotspotAssessment: [],
            mediaFiles: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "selectedServices",
    });

    const onSubmit = async (data: AssessmentFormData) => {
        if (!organization?.id || !user) {
            setError("Organization or user information is missing");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await submitAssessment({
                organizationId: organization.id,
                ...data,
            });
            setAssessmentId(result.assessmentId);
            // Show success message
            Toast({
                title: "Assessment Submitted",
                description: "Your assessment has been successfully submitted.",
                type: "success",
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            Toast({
                title: "Submission Error",
                description: "There was an error submitting your assessment. Please try again.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);

    if (!services) {
        return <div>Loading services...</div>;
    }

    const handleServiceSelection = async (selectedServices: string[]) => {
        try {
            const duration = await estimateDuration({ services: selectedServices });
            setEstimatedDuration(duration);
        } catch (error) {
            console.error('Failed to estimate duration:', error);
        }
    };

        const handleServiceSelection = async (selectedServices: string[]) => {
            try {
                const duration = await estimateDuration({ services: selectedServices });
                setEstimatedDuration(duration);
            } catch (error) {
                console.error('Failed to estimate duration:', error);
            }
        };

        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>Service Selection</CardHeader>
                        <CardContent>
                            <handleServiceSelection
                                services={services}
                                onSelectionChange={handleServiceSelection}
                            />
                            {estimatedDuration && (
                                <p className="mt-2">Estimated Duration: {estimatedDuration} minutes</p>
                            )}
                        </CardContent>
                    </Card>
                    /
                </form>
                return (
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>Vehicle Details</CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="make">Make</Label>
                                        <Input id="make" {...methods.register('vehicleDetails.make')} />
                                        {methods.formState.errors.vehicleDetails?.make && (
                                            <p className="text-red-500">{methods.formState.errors.vehicleDetails.make.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="model">Model</Label>
                                        <Input id="model" {...methods.register('vehicleDetails.model')} />
                                        {methods.formState.errors.vehicleDetails?.model && (
                                            <p className="text-red-500">{methods.formState.errors.vehicleDetails.model.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="year">Year</Label>
                                        <Input id="year" type="number" {...methods.register('vehicleDetails.year', { valueAsNumber: true })} />
                                        {methods.formState.errors.vehicleDetails?.year && (
                                            <p className="text-red-500">{methods.formState.errors.vehicleDetails.year.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="vin">VIN (Optional)</Label>
                                        <Input id="vin" {...methods.register('vehicleDetails.vin')} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        Copy    <Card>
                            <CardHeader>Vehicle Condition Assessment</CardHeader>
                            <CardContent>
                                <VehicleHotspotAssessment
                                    onAssessment={(assessment) => methods.setValue('hotspotAssessment', assessment)}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>Service Selection</CardHeader>
                            <CardContent>
                                {fields.map((field, index) => (
                                    <div key={field.id} className="mb-4 p-4 border rounded">
                                        <Select
                                            value={field.serviceId}
                                            onValueChange={(value) => methods.setValue(`selectedServices.${index}.serviceId`, value)}
                                        >
                                            {services.map((service) => (
                                                <option key={service._id} value={service._id}>{service.name}</option>
                                            ))}
                                        </Select>
                                        <Input
                                            type="number"
                                            {...methods.register(`selectedServices.${index}.quantity`, { valueAsNumber: true })}
                                            className="mt-2"
                                        />
                                        {services.find(s => s._id === field.serviceId)?.customFields.map((customField, fieldIndex) => (
                                            <div key={fieldIndex} className="mt-2">
                                                <Label>{customField.name}</Label>
                                                {customField.type === 'select' ? (
                                                    <Select
                                                        value={methods.watch(`selectedServices.${index}.customFields.${fieldIndex}.value`)}
                                                        onValueChange={(value) => methods.setValue(`selectedServices.${index}.customFields.${fieldIndex}.value`, value)}
                                                    >
                                                        {customField.options?.map((option) => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        type={customField.type === 'number' ? 'number' : 'text'}
                                                        {...methods.register(`selectedServices.${index}.customFields.${fieldIndex}.value`)}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        <Button type="button" onClick={() => remove(index)} className="mt-2">Remove Service</Button>
                                    </div>
                                ))}
                                <Button type="button" onClick={() => append({ serviceId: services[0]._id, quantity: 1, customFields: [] })}>
                                    Add Service
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>Upload Images/Videos</CardHeader>
                            <CardContent>
                                <FileUploadsComponent
                                    onUploadsComplete={(files) => methods.setValue('mediaFiles', files)}
                                />
                            </CardContent>
                        </Card>

                        {assessmentId && (
                            <Card>
                                <CardHeader>Assessment Summary</CardHeader>
                                <CardContent>
                                    <RealTimeSummary assessmentId={assessmentId} />
                                </CardContent>
                            </Card>
                        )}

                        {error && (
                            <div className="text-red-500 mb-4">{error}</div>
                        )}

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                        </Button>
                    </form>
                </FormProvider>
            </FormProvider>
        )
}