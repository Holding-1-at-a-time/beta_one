// app/invoices/page.tsx
import { Suspense } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import InvoicesTable from '@/components/InvoiceTableComponent';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';

export default function InvoicesPage() {
    const invoices = useQuery(api.invoices.list);

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Invoices</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Invoice
                </Button>
            </div>
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                {invoices ? <InvoicesTable invoices={invoices} /> : <div>No invoices found.</div>}
            </Suspense>
        </div>
    );
}