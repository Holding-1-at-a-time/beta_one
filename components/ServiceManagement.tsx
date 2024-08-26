"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useOrganization } from '@clerk/nextjs';
import { SelectItem } from './Select';
import { Button, Input, Select, Switch, Card, CardHeader, CardContent } from '@/components/ui';

export function ServiceManagement() {
    const { organization } = useOrganization();
    const services = useQuery(api.services.getServices, { organizationId: organization?.id ?? '' });
    const createService = useMutation(api.services.createService);
    const updateService = useMutation(api.services.updateService);

    const [newService, setNewService] = useState({
        name: '',
        description: '',
        basePrice: 0,
        priceType: 'fixed',
        customFields: [],
    });

    const handleCreateService = async () => {
        if (!organization?.id) return;
        await createService({
            organizationId: organization.id,
            ...newService,
        });
        setNewService({ name: '', description: '', basePrice: 0, priceType: 'fixed', customFields: [] });
    };

    const handleUpdateService = async (serviceId, updatedFields) => {
        await updateService({
            serviceId,
            ...updatedFields,
        });
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Service Management</h2>
            <Card>
                <CardHeader>Create New Service</CardHeader>
                <CardContent>
                    <Input
                        placeholder="Service Name"
                        value={newService.name}
                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    />
                    <Input
                        placeholder="Description"
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    />
                    <Input
                        type="number"
                        placeholder="Base Price"
                        value={newService.basePrice}
                        onChange={(e) => setNewService({ ...newService, basePrice: parseFloat(e.target.value) })}
                    />
                    <Select
                        value={newService.priceType}
                        onValueChange={(value) => setNewService({ ...newService, priceType: value })}
                    >
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="variable">Variable</SelectItem>
                    </Select>
                    <Button onClick={handleCreateService}>Create Service</Button>
                </CardContent>
            </Card>

            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Existing Services</h3>
                {services?.map((service) => (
                    <Card key={service._id} className="mb-4">
                        <CardHeader>{service.name}</CardHeader>
                        <CardContent>
                            <p>{service.description}</p>
                            <p>Base Price: ${service.basePrice}</p>
                            <p>Price Type: {service.priceType}</p>
                            {/* Add edit functionality here */}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}