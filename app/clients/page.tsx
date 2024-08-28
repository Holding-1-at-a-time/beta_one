// app/clients/page.tsx
import { Suspense } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import ClientList from '@/components/ClientListComponent';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ClientsPage() {
    const clients = useQuery(api.clients.list);

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Clients</h1>
                <Button>Add New Client</Button>
            </div>
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                {clients ? <ClientList clients={clients} /> : <div>No clients found.</div>}
            </Suspense>
        </div>
    );
}