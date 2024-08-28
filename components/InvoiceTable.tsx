// components/InvoiceTableComponent.tsx
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FilePenIcon } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const InvoicesTable: React.FC = () => {
    const { toast } = useToast();
    const invoices = useQuery(api.invoices.list);

    if (invoices === undefined) {
        return <Loader2 className="h-8 w-8 animate-spin" />;
    }

    if (invoices === null) {
        toast({
            title: "Error",
            description: "Failed to load invoices. Please try again.",
            variant: "destructive",
        });
        return null;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.map((invoice) => (
                    <TableRow key={invoice._id} className="animated-3d">
                        <TableCell>{invoice._id}</TableCell>
                        <TableCell>{invoice.clientId}</TableCell>
                        <TableCell>${invoice.amount}</TableCell>
                        <TableCell>
                            <Badge variant={invoice.status === 'Paid' ? 'default' : 'secondary'}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon">
                                    <FilePenIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default InvoicesTable;