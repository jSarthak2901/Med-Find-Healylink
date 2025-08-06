import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Clock, Calendar, ChevronLeft, Award, Users, BookOpen } from "lucide-react";

const DoctorProfile = () => {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Mock doctor data
  const doctor = {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    rating: 4.8,
    reviews: 234,
    experience: "15 years",
    location: "Heart Care Clinic, Mumbai",
    consultationFee: 800,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    qualifications: ["MBBS", "MD Cardiology", "Fellowship in Interventional Cardiology"],
    languages: ["English", "Hindi", "Marathi"],
    about: "Dr. Sarah Johnson is a renowned cardiologist with over 15 years of experience in treating cardiovascular diseases. She specializes in interventional cardiology and has performed over 5000 successful procedures.",
    education: [
      "MBBS - All India Institute of Medical Sciences, New Delhi (2004)",
      "MD Cardiology - Post Graduate Institute, Chandigarh (2008)",
      "Fellowship - Johns Hopkins Hospital, USA (2010)"
    ],
    achievements: [
      "Best Cardiologist Award 2022",
      "Research Excellence Award 2021",
      "Published 50+ research papers"
    ]
  };

  const availableDates = [
    { date: "2024-01-15", day: "Today", slots: 5 },
    { date: "2024-01-16", day: "Tomorrow", slots: 8 },
    { date: "2024-01-17", day: "Wed", slots: 6 },
    { date: "2024-01-18", day: "Thu", slots: 4 },
    { date: "2024-01-19", day: "Fri", slots: 7 }
  ];

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

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
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
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
                <Link to="/booking-confirmation">
                  <Button 
                    className="w-full" 
                    disabled={!selectedDate || !selectedTime}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;