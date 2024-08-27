// pages/services/index.tsx
import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useOrganization } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

export default function ServiceManagementPage() {
    const { organization } = useOrganization();
    const services = useQuery(api.services.listServices, { organizationId: organization?.id ?? '' });
    const updateService = useMutation(api.services.updateService);

    const handleUpdateService = async (serviceId: string, newDetails: { price: number }) => {
        try {
            await updateService({ serviceId, ...newDetails });
            toast({
                title: "Service Updated",
                description: "The service has been updated successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update service. Please try again.",
                variant: "destructive",
            });
        }
    };

    if (!services) {
        return <div>Loading services...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Service Management</h1>
            <ul className="space-y-4">
                {services.map(service => (
                    <li key={service._id} className="flex items-center justify-between">
                        <span>{service.name} - ${service.basePrice.toFixed(2)}</span>
                        <div className="flex items-center space-x-2">
                            <Input
                                type="number"
                                defaultValue={service.basePrice}
                                onChange={(e) => {
                                    const newPrice = parseFloat(e.target.value);
                                    if (!isNaN(newPrice)) {
                                        handleUpdateService(service._id, { price: newPrice });
                                    }
                                }}
                            />
                            <Button onClick={() => handleUpdateService(service._id, { price: service.basePrice + 10 })}>
                                Increase Price
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}