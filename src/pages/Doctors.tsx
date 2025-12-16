import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Doctor {
  id: string;
  user_id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  location: string;
  consultationFee: number;
  nextSlot: string;
  image: string | null;
}

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const specialties = ["Cardiologist", "Dermatologist", "Pediatrician", "Orthopedic", "General Medicine", "Cardiology", "Pediatrics", "Neurology"];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data: doctorProfiles, error } = await supabase
        .from('doctor_profiles')
        .select(`
          id,
          user_id,
          specialty,
          rating,
          experience_years,
          consultation_fee,
          hospital_affiliation,
          avatar_url,
          is_available
        `)
        .eq('is_available', true);

      if (error) {
        console.error('Error fetching doctors:', error);
        return;
      }

      // Fetch profile info for each doctor
      const doctorsWithProfiles = await Promise.all(
        (doctorProfiles || []).map(async (doc) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', doc.user_id)
            .maybeSingle();

          return {
            id: doc.id,
            user_id: doc.user_id,
            name: profile?.full_name ? `Dr. ${profile.full_name}` : 'Doctor',
            specialty: doc.specialty,
            rating: Number(doc.rating) || 4.5,
            experience: `${doc.experience_years || 0} years`,
            location: doc.hospital_affiliation || 'Available Online',
            consultationFee: Number(doc.consultation_fee) || 500,
            nextSlot: 'Available Today',
            image: doc.avatar_url || null,
          };
        })
      );

      setDoctors(doctorsWithProfiles);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSpecialty = selectedSpecialty === "" || 
      doctor.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesSearch = searchTerm === "" || 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

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
              className={selectedSpecialty === "" ? "bg-secondary text-secondary-foreground" : "bg-background/10 border-background/20 text-primary-foreground hover:bg-background/20"}
            >
              All
            </Button>
            {specialties.map((specialty) => (
              <Button
                key={specialty}
                variant={selectedSpecialty === specialty ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSelectedSpecialty(specialty)}
                className={selectedSpecialty === specialty ? "bg-secondary text-secondary-foreground" : "bg-background/10 border-background/20 text-primary-foreground hover:bg-background/20"}
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
          <h2 className="text-xl font-semibold">
            {selectedSpecialty || "Available Doctors"} ({filteredDoctors.length})
          </h2>
          {(selectedSpecialty || searchTerm) && (
            <Button variant="outline" size="sm" onClick={() => { setSelectedSpecialty(""); setSearchTerm(""); }}>
              Clear Filters
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No doctors found matching your criteria.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSelectedSpecialty(""); setSearchTerm(""); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    {doctor.image ? (
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <UserCircle className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
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
                      <Link to={`/doctor/${doctor.user_id}`}>
                        <Button size="sm">Book Now</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;