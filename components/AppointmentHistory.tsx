import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { useOrganization } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const AppointmentHistory: React.FC = () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const { organization } = useOrganization();
    const { toast } = useToast();

    const appointments = useQuery(api.appointments.getAppointments, {
        organizationId: organization?.id ?? '',
        page,
        pageSize
    });

    const handleNextPage = () => setPage(prevPage => prevPage + 1);
    const handlePreviousPage = () => setPage(prevPage => Math.max(prevPage - 1, 1));

    if (appointments === undefined) {
        return <Loader2 className="h-8 w-8 animate-spin" />;
    }

    if (appointments === null) {
        toast({
            title: "Error",
            description: "Failed to load appointments. Please try again.",
            variant: "destructive",
        });
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Appointment History</CardTitle>
            </CardHeader>
            <CardContent>
                {appointments.map(appointment => (
                    <div key={appointment._id} className="mb-4 p-4 border rounded">
                        <p>Date: {new Date(appointment.date).toLocaleString()}</p>
                        <p>Service: {appointment.serviceName}</p>
                        <p>Status: {appointment.status}</p>
                    </div>
                ))}
                <div className="flex justify-between mt-4">
                    <Button onClick={handlePreviousPage} disabled={page === 1}>Previous</Button>
                    <Button onClick={handleNextPage} disabled={appointments.length < pageSize}>Next</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default AppointmentHistory;