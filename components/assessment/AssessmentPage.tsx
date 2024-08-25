"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

type AssessmentQuestion = {
    id: string;
    question: string;
    type: 'text' | 'select' | 'number';
    options?: string[];
};

export default function AssessmentPage() {
    const params = useParams();
    const organizationId = params?.organizationId as string;
    const tenant = useQuery(api.tenants.getTenantByOrganizationId, { organizationId });
    const [clientInfo, setClientInfo] = useState({ name: '', email: '' });
    const [vehicleInfo, setVehicleInfo] = useState({ make: '', model: '', year: '' });
    const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [estimate, setEstimate] = useState<number | null>(null);
    const [loading, setLoading] = useState(false); // Add loading state
    const submitAssessment = useMutation(api.assessments.submit);
    const generateAIQuestions = useMutation(api.ai.generateAssessmentQuestions);
    const generateEstimate = useMutation(api.ai.generateEstimate);
    const createPaymentIntent = useMutation(api.payments.createPaymentIntent);

    const handleGenerateQuestions = useCallback(async () => {
        if (!tenant) return;

        setLoading(true); // Set loading to true when starting
        try {
            const questions = await generateAIQuestions({
                tenantId: tenant._id,
                vehicleInfo,
            });
            setAssessmentQuestions(questions);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to generate assessment questions. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false); // Set loading to false when done
        }
    }, [generateAIQuestions, tenant, vehicleInfo]);

    useEffect(() => {
        if (tenant && vehicleInfo.make && vehicleInfo.model && vehicleInfo.year) {
            handleGenerateQuestions();
        }
    }, [handleGenerateQuestions, tenant, vehicleInfo]);

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) {
            toast({
                title: "Error",
                description: "Tenant information is missing.",
                variant: "destructive",
            });
            return;
        }

        try {
            const estimateAmount = await generateEstimate({
                tenantId: tenant._id,
                vehicleInfo,
                assessmentData: Object.entries(answers).map(([questionId, answer]) => ({
                    question: assessmentQuestions.find(q => q.id === questionId)?.question ?? '',
                    answer,
                })),
            });

            setEstimate(estimateAmount);

            const assessmentId = await submitAssessment({
                tenantId: tenant._id,
                clientName: clientInfo.name,
                clientEmail: clientInfo.email,
                vehicleInfo,
                assessmentData: Object.entries(answers).map(([questionId, answer]) => ({
                    question: assessmentQuestions.find(q => q.id === questionId)?.question ?? '',
                    answer,
                })),
                estimateAmount,
            });

            toast({
                title: "Success",
                description: "Assessment submitted successfully.",
            });

            // Create a payment intent for the deposit
            const depositAmount = estimateAmount * 0.1; // 10% deposit
            const paymentIntent = await createPaymentIntent({
                assessmentId,
                amount: depositAmount,
            });

            // Here you would typically redirect to a payment page or open a payment modal
            // using the paymentIntent.clientSecret
            console.log("Payment Intent created:", paymentIntent);

        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "An unknown error occurred",
                variant: "destructive",
            });
        }
    };

    if (!tenant) {
        return (
            <div>
                {loading ? (
                <Loader2 />
                ) : (
            <Card className="w-full max-w-2xl mx-auto mt-8">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Vehicle Assessment for {tenant.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="clientName">Your Name</Label>
                                <Input
                                    id="clientName"
                                    value={clientInfo.name}
                                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="clientEmail">Your Email</Label>
                                <Input
                                    id="clientEmail"
                                    type="email"
                                    value={clientInfo.email}
                                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="make">Vehicle Make</Label>
                                <Input
                                    id="make"
                                    value={vehicleInfo.make}
                                    onChange={(e) => setVehicleInfo({ ...vehicleInfo, make: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="model">Vehicle Model</Label>
                                <Input
                                    id="model"
                                    value={vehicleInfo.model}
                                    onChange={(e) => setVehicleInfo({ ...vehicleInfo, model: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="year">Vehicle Year</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    value={vehicleInfo.year}
                                    onChange={(e) => setVehicleInfo({ ...vehicleInfo, year: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        Copy      {assessmentQuestions.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Assessment Questions</h3>
                                {assessmentQuestions.map((question) => (
                                    <div key={question.id}>
                                        <Label htmlFor={question.id}>{question.question}</Label>
                                        {question.type === 'text' && (
                                            <Textarea
                                                id={question.id}
                                                value={answers[question.id] || ''}
                                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                                required
                                            />
                                        )}
                                        {question.type === 'select' && (
                                            <select
                                                id={question.id}
                                                value={answers[question.id] || ''}
                                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                                required
                                                className="w-full p-2 border rounded"
                                            >
                                                <option value="">Select an option</option>
                                                {question.options?.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        {question.type === 'number' && (
                                            <Input
                                                id={question.id}
                                                type="number"
                                                value={answers[question.id] || ''}
                                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                                required
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {estimate !== null && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold">Estimated Cost</h3>
                                <p className="text-2xl font-bold">${estimate.toFixed(2)}</p>
                                <p className="text-sm text-gray-500">10% deposit required: ${(estimate * 0.1).toFixed(2)}</p>
                            </div>
                        )}

                        <Button type="submit" className="w-full">
                            Submit Assessment and Pay Deposit
                        </Button>
                    </form>
                </CardContent>
                        </Card>
                )}
            </div>
            
        );
    }
}