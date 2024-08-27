import React from 'react';
import { useQuery } from 'convex/react';
import { useOrganization } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { Calendar, CalendarProps } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const AvailabilityCalendar: React.FC = () => {
    const { organization } = useOrganization();
    const { toast } = useToast();

    const availableSlots = useQuery(api.availability.getAvailableSlots, {
        organizationId: organization?.id ?? '',
    });

    if (availableSlots === undefined) {
        return <Loader2 className="h-8 w-8 animate-spin" />;
    }

    if (availableSlots === null) {
        toast({
            title: "Error",
            description: "Failed to load available slots. Please try again.",
            variant: "destructive",
        });
        return null;
    }

    const events: CalendarProps['events'] = availableSlots.map(slot => ({
        id: slot._id,
        name: 'Available',
        startDateTime: new Date(slot.startTime),
        endDateTime: new Date(slot.endTime),
    }));

    return (
        <Calendar
            events={events}
            onEventClick={(event) => {
                toast({
                    title: "Available Slot",
                    description: `Start: ${event.startDateTime.toLocaleString()}\nEnd: ${event.endDateTime.toLocaleString()}`,
                });
            }}
        />
    );
};

export default AvailabilityCalendar;