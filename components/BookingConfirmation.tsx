import { useRouter } from 'next/router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const BookingConfirmation: React.FC = () => {
    const router = useRouter();
    const { toast } = useToast();
    const { bookingId } = router.query;

    const bookingDetails = useQuery(api.bookings.getBookingDetails, {
        bookingId: bookingId as string
    });

    const sendConfirmationEmail = useMutation(api.bookings.sendConfirmationEmail);

    const handleSendEmail = async () => {
        try {
            await sendConfirmationEmail({ bookingId: bookingId as string });
            toast({
                title: "Success",
                description: "Confirmation email sent successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send confirmation email. Please try again.",
                variant: "destructive",
            });
        }
    };

    if (bookingDetails === undefined) {
        return <Loader2 className="h-8 w-8 animate-spin" />;
    }

    if (bookingDetails === null) {
        toast({
            title: "Error",
            description: "Failed to load booking details. Please try again.",
            variant: "destructive",
        });
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Booking Confirmation</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Service: {bookingDetails.serviceName}</p>
                <p>Date: {new Date(bookingDetails.date).toLocaleString()}</p>
                <Button onClick={handleSendEmail} className="mt-4">Send Confirmation Email</Button>
            </CardContent>
        </Card>
    );
};

export default BookingConfirmation;