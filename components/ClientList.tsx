// components/ClientListComponent.tsx
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FilePenIcon, TrashIcon } from '@/components/Icons';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ClientList: React.FC = () => {
    const { toast } = useToast();
    const clients = useQuery(api.clients.list);

    if (clients === undefined) {
        return <Loader2 className="h-8 w-8 animate-spin" />;
    }

    if (clients === null) {
        toast({
            title: "Error",
            description: "Failed to load clients. Please try again.",
            variant: "destructive",
        });
        return null;
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {clients.map((client) => (
                <Card key={client._id} className="animated-3d">
                    <CardContent className="grid gap-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="border w-10 h-10">
                                <AvatarImage src="/placeholder-user.jpg" />
                                <AvatarFallback>{client.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{client.name}</p>
                                <p className="text-sm text-muted-foreground">{client.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Total Invoices: ${client.totalInvoices}</p>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon">
                                    <FilePenIcon className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                </Button>
                                <Button variant="outline" size="icon">
                                    <TrashIcon className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default ClientList;