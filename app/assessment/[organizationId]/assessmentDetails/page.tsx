// pages/assessments/[id].tsx
import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

export default function AssessmentDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const assessment = useQuery(api.assessments.getAssessmentById, { id: id as string });
    const generateAIAssessment = useMutation(api.ai.generateAIAssessment);

    if (!assessment) {
        return <div>Loading assessment...</div>;
    }

    const handleGenerateAIAssessment = async () => {
        try {
            await generateAIAssessment({ assessmentId: assessment._id });
            toast({
                title: "AI Assessment Generated",
                description: "The AI assessment has been generated successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to generate AI assessment. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Assessment Detail</h1>
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Make: {assessment.vehicleDetails.make}</p>
                    <p>Model: {assessment.vehicleDetails.model}</p>
                    <p>Year: {assessment.vehicleDetails.year}</p>
                    <p>VIN: {assessment.vehicleDetails.vin || 'N/A'}</p>
                </CardContent>
            </Card>
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Services</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul>
                        {assessment.selectedServices.map((service, index) => (
                            <li key={index}>{service.name} - Quantity: {service.quantity}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Condition Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul>
                        {assessment.hotspotAssessment.map((hotspot, index) => (
                            <li key={index}>{hotspot.part}: {hotspot.issue} (Severity: {hotspot.severity})</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Estimated Price</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">${assessment.estimatedPrice.toFixed(2)}</p>
                </CardContent>
            </Card>
            {assessment.aiAssessment ? (
                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>AI Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{assessment.aiAssessment.summary}</p>
                    </CardContent>
                </Card>
            ) : (
                <Button onClick={handleGenerateAIAssessment}>Generate AI Assessment</Button>
            )}
        </div>
    );
}