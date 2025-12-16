import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Clock, Calendar, ChevronLeft, Award, Users, BookOpen, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, addDays } from "date-fns";

interface DoctorData {
  id: string;
  user_id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: string;
  location: string;
  consultationFee: number;
  image: string | null;
  qualifications: string[];
  languages: string[];
  about: string;
  education: string[];
}

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDoctor();
    }
  }, [id]);

  const fetchDoctor = async () => {
    try {
      const { data: doctorProfile, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', id)
        .maybeSingle();

      if (error || !doctorProfile) {
        console.error('Error fetching doctor:', error);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', id)
        .maybeSingle();

      setDoctor({
        id: doctorProfile.id,
        user_id: doctorProfile.user_id,
        name: profile?.full_name ? `Dr. ${profile.full_name}` : 'Doctor',
        specialty: doctorProfile.specialty,
        rating: Number(doctorProfile.rating) || 4.5,
        reviews: doctorProfile.total_reviews || 0,
        experience: `${doctorProfile.experience_years || 0} years`,
        location: doctorProfile.hospital_affiliation || 'Available Online',
        consultationFee: Number(doctorProfile.consultation_fee) || 500,
        image: doctorProfile.bio?.startsWith('http') ? doctorProfile.bio : null,
        qualifications: doctorProfile.qualification ? [doctorProfile.qualification] : ['MBBS'],
        languages: ['English', 'Hindi'],
        about: `Experienced ${doctorProfile.specialty} specialist with ${doctorProfile.experience_years || 0} years of experience.`,
        education: doctorProfile.qualification ? [doctorProfile.qualification] : [],
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAvailableDates = () => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = addDays(new Date(), i);
      dates.push({
        date: format(date, 'yyyy-MM-dd'),
        day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(date, 'EEE'),
        slots: Math.floor(Math.random() * 5) + 3,
      });
    }
    return dates;
  };

  const availableDates = generateAvailableDates();

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  const handleBookAppointment = async () => {
    if (!user) {
      toast.error('Please login to book an appointment');
      navigate('/auth');
      return;
    }

    if (!selectedDate || !selectedTime || !doctor) {
      toast.error('Please select date and time');
      return;
    }

    setBooking(true);

    try {
      // Convert time to 24-hour format
      const [time, period] = selectedTime.split(' ');
      const [hours, minutes] = time.split(':');
      let hour24 = parseInt(hours);
      if (period === 'PM' && hour24 !== 12) hour24 += 12;
      if (period === 'AM' && hour24 === 12) hour24 = 0;
      const timeFormatted = `${hour24.toString().padStart(2, '0')}:${minutes}:00`;

      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          doctor_id: doctor.user_id,
          appointment_date: selectedDate,
          appointment_time: timeFormatted,
          status: 'scheduled',
          consultation_type: 'in_person',
          reason_for_visit: `Consultation with ${doctor.specialty}`,
        });

      if (error) {
        console.error('Booking error:', error);
        toast.error('Failed to book appointment');
        return;
      }

      toast.success('Appointment booked successfully!');
      navigate('/booking-confirmation', { 
        state: { 
          doctor: doctor.name, 
          date: selectedDate, 
          time: selectedTime,
          specialty: doctor.specialty 
        } 
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Doctor not found</p>
          <Link to="/doctors">
            <Button>Back to Doctors</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/doctors">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-background/10">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Doctor Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Doctor Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  {doctor.image ? (
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                      <UserCircle className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{doctor.name}</h2>
                    <Badge className="mb-2">{doctor.specialty}</Badge>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{doctor.rating} ({doctor.reviews} reviews)</span>
                      </div>
                      <span>• {doctor.experience}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{doctor.location}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {/* About */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">About</h3>
                    <p className="text-muted-foreground">{doctor.about}</p>
                  </div>

                  <Separator />

                  {/* Qualifications */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Qualifications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.qualifications.map((qual, index) => (
                        <Badge key={index} variant="secondary">{qual}</Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Education */}
                  {doctor.education.length > 0 && (
                    <>
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Education
                        </h3>
                        <ul className="space-y-2">
                          {doctor.education.map((edu, index) => (
                            <li key={index} className="text-sm text-muted-foreground">• {edu}</li>
                          ))}
                        </ul>
                      </div>

                      <Separator />
                    </>
                  )}

                  {/* Languages */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((lang, index) => (
                        <Badge key={index} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Section */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Book Appointment
                </CardTitle>
                <div className="text-2xl font-bold">
                  ₹{doctor.consultationFee}
                  <span className="text-sm font-normal text-muted-foreground ml-1">consultation</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Date Selection */}
                <div>
                  <h4 className="font-medium mb-3">Select Date</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {availableDates.map((dateInfo) => (
                      <Button
                        key={dateInfo.date}
                        variant={selectedDate === dateInfo.date ? "default" : "outline"}
                        className="h-auto p-3 flex flex-col items-center"
                        onClick={() => setSelectedDate(dateInfo.date)}
                      >
                        <span className="font-medium">{dateInfo.day}</span>
                        <span className="text-xs text-muted-foreground">
                          {dateInfo.slots} slots
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <h4 className="font-medium mb-3">Select Time</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <Button 
                  className="w-full" 
                  disabled={!selectedDate || !selectedTime || booking}
                  onClick={handleBookAppointment}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {booking ? 'Booking...' : 'Book Appointment'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;