// pages/assessments/index.tsx
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useOrganization } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AssessmentListPage() {
    const { organization } = useOrganization();
    const assessments = useQuery(api.assessments.listAssessments, {
        organizationId: organization?.id ?? ''
    });

    if (!assessments) {
        return <div>Loading assessments...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Assessments</h1>
            <Link href="/assessments/new">
                <Button>New Assessment</Button>
            </Link>
            <Table className="mt-4">
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Estimated Price</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assessments.map((assessment) => (
                        <TableRow key={assessment._id}>
                            <TableCell>{new Date(assessment.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{`${assessment.vehicleDetails.year} ${assessment.vehicleDetails.make} ${assessment.vehicleDetails.model}`}</TableCell>
                            <TableCell>{assessment.status}</TableCell>
                            <TableCell>${assessment.estimatedPrice.toFixed(2)}</TableCell>
                            <TableCell>
                                <Link href={`/assessments/${assessment._id}`}>
                                    <Button variant="outline">View</Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}