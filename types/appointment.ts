export type AppointmentStatus = "confirmed" | "cancelled" | "pending" | "completed" | "unavailable";

export interface Appointment {
    _id: string;
    _creationTime: number;
    notes?: string;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
    status: AppointmentStatus;
    serviceName: string;
    date: string;
    endTime: number;
    settings: Record<string, any>;
}