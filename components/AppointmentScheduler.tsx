import React, { useState, useMemo, useCallback } from "react";
import { useOrganization } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { format, parseISO, isValid, startOfDay, endOfDay } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/AppointmentForm";
import { useAppSettings } from "@/hooks/useAppSettings";
import { usePermissions } from "@/hooks/usePermissions";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Appointment, AppointmentStatus } from "@/types/appointment";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface SortOption {
    field: keyof Appointment;
    direction: 'asc' | 'desc';
}

export function AppointmentScheduler(): JSX.Element {
    const { organization } = useOrganization();
    const { timeZone, dateFormat, timeFormat } = useAppSettings();
    const { hasPermission } = usePermissions();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [sortOption, setSortOption] = useState<SortOption>({ field: 'date', direction: 'asc' });
    const [isCreatingAppointment, setIsCreatingAppointment] = useState<boolean>(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10;

    const appointmentsQuery = useQuery(api.appointments.listByOrganization,
        organization?.id ? {
            organizationId: organization.id,
            startDate: zonedTimeToUtc(startOfDay(selectedDate), timeZone).toISOString(),
            endDate: zonedTimeToUtc(endOfDay(selectedDate), timeZone).toISOString(),
            page: currentPage,
            pageSize,
        } : 'skip'
    );

    const createAppointment = useMutation(api.appointments.create);
    const updateAppointment = useMutation(api.appointments.update);
    const cancelAppointment = useMutation(api.appointments.cancel);

    const filteredAppointments = useMemo(() => {
        if (!appointmentsQuery?.items) return [];
        return appointmentsQuery.items.filter((appointment) => {
            const matchesSearch = searchTerm === "" ||
                appointment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [appointmentsQuery?.items, searchTerm, statusFilter]);

    const sortedAppointments = useMemo(() => {
        return [...filteredAppointments].sort((a, b) => {
            if (a[sortOption.field] < b[sortOption.field]) return sortOption.direction === "asc" ? -1 : 1;
            if (a[sortOption.field] > b[sortOption.field]) return sortOption.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredAppointments, sortOption]);

    const handleDateChange = useCallback((date: Date | undefined) => {
        if (date && isValid(date)) {
            setSelectedDate(date);
            setCurrentPage(1);
        }
    }, []);

    const handleSort = useCallback((field: keyof Appointment) => {
        setSortOption(prev => ({
            field,
            direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
        }));
    }, []);

    const handleAppointmentCreate = useCallback(async (appointmentData: Partial<Appointment>) => {
        if (!organization) {
            toast({ title: "Error", description: "No organization selected", variant: "destructive" });
            return;
        }
        try {
            await createAppointment({
                ...appointmentData,
                organizationId: organization.id,
                date: zonedTimeToUtc(new Date(appointmentData.date), timeZone).toISOString(),
            });
            toast({ title: "Success", description: "Appointment created successfully" });
            setIsCreatingAppointment(false);
        } catch (error) {
            console.error("Error creating appointment:", error);
            toast({ title: "Error", description: "Failed to create appointment", variant: "destructive" });
        }
    }, [organization, createAppointment, timeZone]);

    const handleAppointmentUpdate = useCallback(async (appointmentId: string, appointmentData: Partial<Appointment>) => {
        try {
            await updateAppointment({
                id: appointmentId,
                ...appointmentData,
                date: zonedTimeToUtc(new Date(appointmentData.date!), timeZone).toISOString(),
            });
            toast({ title: "Success", description: "Appointment updated successfully" });
            setEditingAppointment(null);
        } catch (error) {
            console.error("Error updating appointment:", error);
            toast({ title: "Error", description: "Failed to update appointment", variant: "destructive" });
        }
    }, [updateAppointment, timeZone]);

    const handleAppointmentCancel = useCallback(async (appointmentId: string) => {
        try {
            await cancelAppointment({ id: appointmentId });
            toast({ title: "Success", description: "Appointment cancelled successfully" });
        } catch (error) {
            console.error("Error cancelling appointment:", error);
            toast({ title: "Error", description: "Failed to cancel appointment", variant: "destructive" });
        }
    }, [cancelAppointment]);

    if (!organization) {
        return <div>Loading organization...</div>;
    }

    if (appointmentsQuery.error) {
        return <div>Error loading appointments: {appointmentsQuery.error.message}</div>;
    }

    return (
        <ErrorBoundary fallback={<div>An error occurred while rendering the appointment scheduler.</div>}>
            <div className="flex flex-col h-full">
                <header className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Appointments</h1>
                    {hasPermission('create_appointment') && (
                        <Button variant="secondary" onClick={() => setIsCreatingAppointment(true)}>
                            Create Appointment
                        </Button>
                    )}
                </header>
                <div className="flex-1 grid grid-cols-[300px_1fr] gap-4 p-4">
                    <div className="bg-background rounded-lg shadow-md p-4">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateChange}
                            className="w-full"
                        />
                        <div className="mt-4">
                            <Input
                                placeholder="Search appointments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mb-2"
                            />
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => setStatusFilter(value as AppointmentStatus | 'all')}
                            >
                                <option value="all">All Statuses</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </Select>
                        </div>
                    </div>
                    <div className="bg-background rounded-lg shadow-md p-4 overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="font-bold">Appointments for </span>
                                {format(selectedDate, dateFormat, { timeZone })}
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Sort by: {sortOption.field} {sortOption.direction === "asc" ? "↑" : "↓"}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Sort by:</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {Object.keys(sortedAppointments[0] || {}).map((field) => (
                                        <DropdownMenuCheckboxItem
                                            key={field}
                                            checked={sortOption.field === field}
                                            onCheckedChange={() => handleSort(field as keyof Appointment)}
                                        >
                                            {field.charAt(0).toUpperCase() + field.slice(1)}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedAppointments.map((appointment) => (
                                    <TableRow key={appointment._id}>
                                        <TableCell>{format(utcToZonedTime(parseISO(appointment.date), timeZone), timeFormat)}</TableCell>
                                        <TableCell>{appointment.customer}</TableCell>
                                        <TableCell>{appointment.service}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    appointment.status === "scheduled"
                                                        ? "secondary"
                                                        : appointment.status === "completed"
                                                            ? "success"
                                                            : "destructive"
                                                }
                                            >
                                                {appointment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {hasPermission('edit_appointment') && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setEditingAppointment(appointment)}
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                                {hasPermission('cancel_appointment') && appointment.status === "scheduled" && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleAppointmentCancel(appointment._id)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {appointmentsQuery.status === "loading" && <Spinner className="mt-4" />}
                        {appointmentsQuery.hasNextPage && (
                            <Button onClick={() => setCurrentPage(prev => prev + 1)} className="mt-4">
                                Load More
                            </Button>
                        )}
                    </div>
                </div>
                <Dialog open={isCreatingAppointment} onOpenChange={setIsCreatingAppointment}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Appointment</DialogTitle>
                        </DialogHeader>
                        <AppointmentForm onSubmit={handleAppointmentCreate} onCancel={() => setIsCreatingAppointment(false)} />
                    </DialogContent>
                </Dialog>
                <Dialog open={!!editingAppointment} onOpenChange={() => setEditingAppointment(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Appointment</DialogTitle>
                        </DialogHeader>
                        {editingAppointment && (
                            <AppointmentForm
                                onSubmit={(data) => handleAppointmentUpdate(editingAppointment._id, data)}
                                onCancel={() => setEditingAppointment(null)}
                                initialData={editingAppointment}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </ErrorBoundary>
    );
}