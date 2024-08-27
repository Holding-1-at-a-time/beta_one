import React from 'react';
import { useQuery } from 'convex/react';
import { useOrganization } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { Calendar, CalendarProps } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const AppointmentOverview: React.FC = () => {
    const { organization } = useOrganization();
    const { toast } = useToast();

    const appointments = useQuery(api.appointments.getAppointments, {
        organizationId: organization?.id ?? '',
    });

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

    const events: CalendarProps['events'] = appointments.map(appointment => ({
        id: appointment._id,
        name: appointment.serviceName,
        startDateTime: new Date(appointment.date),
        endDateTime: new Date(new Date(appointment.date).getTime() + 60 * 60 * 1000), // Assume 1 hour duration
    }));

    return (
        <Calendar
            events={events}
            onEventClick={(event) => {
                toast({
                    title: "Appointment Details",
                    description: `Service: ${event.name}\nTime: ${event.startDateTime.toLocaleString()}`,
                });
            }}
        />
    );
};

export default AppointmentOverview;