// app/appointments/page.tsx
'use client';
import { useState } from 'react';
import { AppointmentScheduler } from '@/components/AppointmentScheduler';
import { AppointmentForm } from '@/components/AppointmentForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AppointmentsPage() {
    const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);

    const handleAppointmentSubmit = (data) => {
        // Handle appointment creation logic here
        console.log(data);
        setIsCreatingAppointment(false);
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Appointments</h1>
                <Button onClick={() => setIsCreatingAppointment(true)}>Create Appointment</Button>
            </div>
            <AppointmentScheduler />
            <Dialog open={isCreatingAppointment} onOpenChange={setIsCreatingAppointment}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Appointment</DialogTitle>
                    </DialogHeader>
                    <AppointmentForm
                        onSubmit={handleAppointmentSubmit}
                        onCancel={() => setIsCreatingAppointment(false)}
                        selectedDate={new Date()}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}