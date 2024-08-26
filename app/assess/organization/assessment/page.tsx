import React from 'react';
import { ComprehensiveAssessmentForm } from '../components/ComprehensiveAssessmentForm';

export default function AssessmentPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Vehicle Assessment</h1>
            <ComprehensiveAssessmentForm />
        </div>
    );
}