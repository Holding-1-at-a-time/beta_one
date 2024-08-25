// app/assess/[organizationId]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import AssessmentPage from '@/components/AssessmentPage';
import { Loader2 } from 'lucide-react';

export default function AssessmentRoute({ params }: Readonly<{ params: { organizationId: string } }>) {
    if (!params.organizationId) {
        notFound();
    }

    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <AssessmentPage />
        </Suspense>
    );
}