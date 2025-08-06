import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock, Filter } from "lucide-react";
import { Link } from "react-router-dom";

const mockDoctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    rating: 4.8,
    experience: "15 years",
    location: "Heart Care Clinic, Mumbai",
    consultationFee: 800,
    nextSlot: "Today 2:00 PM",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Dr. Rajesh Kumar",
    specialty: "Dermatologist",
    rating: 4.9,
    experience: "12 years",
    location: "Skin Care Center, Delhi",
    consultationFee: 600,
    nextSlot: "Tomorrow 10:00 AM",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Dr. Priya Sharma",
    specialty: "Pediatrician",
    rating: 4.7,
    experience: "10 years",
    location: "Children's Hospital, Bangalore",
    consultationFee: 500,
    nextSlot: "Today 4:30 PM",
    image: "https://images.unsplash.com/photo-1594824388548-c2c2469c0e36?w=150&h=150&fit=crop&crop=face"
  }
];

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  const specialties = ["Cardiologist", "Dermatologist", "Pediatrician", "Orthopedic", "General Medicine"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Find Doctors</h1>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search doctors, specialties, conditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background text-foreground"
            />
          </div>

          {/* Specialty Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedSpecialty === "" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSelectedSpecialty("")}
              className="bg-background/10 border-background/20 text-primary-foreground hover:bg-background/20"
            >
              All
            </Button>
            {specialties.map((specialty) => (
              <Button
                key={specialty}
                variant={selectedSpecialty === specialty ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSelectedSpecialty(specialty)}
                className="bg-background/10 border-background/20 text-primary-foreground hover:bg-background/20"
              >
                {specialty}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctors List */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Available Doctors</h2>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{doctor.name}</h3>
                    <Badge variant="secondary" className="mb-2">
                      {doctor.specialty}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{doctor.rating}</span>
                      <span>• {doctor.experience}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{doctor.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-primary font-medium">{doctor.nextSlot}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold">₹{doctor.consultationFee}</span>
                      <span className="text-sm text-muted-foreground ml-1">consultation</span>
                    </div>
                    <Link to={`/doctor/${doctor.id}`}>
                      <Button size="sm">Book Now</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Doctors;