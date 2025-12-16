import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Calendar, Clock, MapPin, User, CreditCard, Phone, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const BookingConfirmation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const bookingData = location.state;

  // Use passed data or fallback
  const booking = {
    id: `BK-${Date.now().toString().slice(-8)}`,
    doctor: {
      name: bookingData?.doctor || "Doctor",
      specialty: bookingData?.specialty || "Specialist",
      location: "HealyLink Clinic"
    },
    appointment: {
      date: bookingData?.date ? format(new Date(bookingData.date), 'MMMM d, yyyy') : "Scheduled",
      time: bookingData?.time || "TBD",
      type: "In-Person Consultation"
    },
    patient: {
      name: user?.user_metadata?.full_name || "Patient",
      email: user?.email || "N/A"
    },
    payment: {
      status: "Pending"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4">
        {/* Success Header */}
        <div className="text-center mb-8 mt-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">
            Your appointment has been successfully booked
          </p>
        </div>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Details
            </CardTitle>
            <Badge variant="secondary" className="w-fit">
              Booking ID: {booking.id}
            </Badge>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Doctor Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <UserCircle className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{booking.doctor.name}</h3>
                <Badge className="mb-1">{booking.doctor.specialty}</Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{booking.doctor.location}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Appointment Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{booking.appointment.date}</p>
                  <p className="text-sm text-muted-foreground">Date</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{booking.appointment.time}</p>
                  <p className="text-sm text-muted-foreground">Time</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Patient Info */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{booking.patient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{booking.patient.email}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Info */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Status
              </h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline">{booking.payment.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Please arrive 15 minutes before your scheduled appointment</li>
              <li>• Bring any relevant medical reports and documents</li>
              <li>• Keep your medications list ready for reference</li>
              <li>• You can reschedule up to 24 hours before the appointment</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link to="/dashboard">
            <Button className="w-full">
              View My Appointments
            </Button>
          </Link>
          <Link to="/doctors">
            <Button variant="outline" className="w-full">
              Book Another Appointment
            </Button>
          </Link>
          <Button variant="ghost" className="w-full">
            <Phone className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;