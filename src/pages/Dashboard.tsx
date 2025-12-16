import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  User, 
  Heart, 
  Activity, 
  Bell,
  Video,
  Phone,
  MessageCircle,
  ChevronRight,
  Plus,
  LogOut,
  Settings,
  FileText,
  AlertCircle,
  X
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [rescheduleDialog, setRescheduleDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const navigate = useNavigate();
  const { user, role, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && user && role === 'doctor') {
      navigate('/doctor-dashboard');
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchVitals();
    }
  }, [user]);

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', user?.id)
      .order('appointment_date', { ascending: true });
    if (error) {
      console.error('Error fetching appointments:', error);
    } else {
      setAppointments(data || []);
    }
  };

  const fetchVitals = async () => {
    const { data, error } = await supabase
      .from('patient_vitals')
      .select('*')
      .eq('patient_id', user?.id)
      .order('recorded_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching vitals:', error);
    } else {
      setVitals(data || []);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !newDate || !newTime) return;

    const { error } = await supabase
      .from('appointments')
      .update({ 
        appointment_date: newDate, 
        appointment_time: newTime,
        status: 'rescheduled'
      })
      .eq('id', selectedAppointment.id);

    if (error) {
      toast.error('Failed to reschedule appointment');
    } else {
      toast.success('Appointment rescheduled successfully');
      fetchAppointments();
    }
    setRescheduleDialog(false);
    setSelectedAppointment(null);
    setNewDate("");
    setNewTime("");
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', selectedAppointment.id);

    if (error) {
      toast.error('Failed to cancel appointment');
    } else {
      toast.success('Appointment cancelled');
      fetchAppointments();
    }
    setCancelDialog(false);
    setSelectedAppointment(null);
  };

  const today = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments.filter(a => a.appointment_date >= today && a.status !== 'cancelled');
  const pastAppointments = appointments.filter(a => a.appointment_date < today || a.status === 'completed');

  const latestVitals = vitals[0];
  const healthStats = [
    { 
      icon: Heart, 
      label: "Heart Rate", 
      value: latestVitals?.heart_rate ? `${latestVitals.heart_rate} bpm` : "-- bpm", 
      trend: "normal" 
    },
    { 
      icon: Activity, 
      label: "Blood Pressure", 
      value: latestVitals?.blood_pressure_systolic ? 
        `${latestVitals.blood_pressure_systolic}/${latestVitals.blood_pressure_diastolic}` : "--/--", 
      trend: "normal" 
    },
    { 
      icon: User, 
      label: "Weight", 
      value: latestVitals?.weight ? `${latestVitals.weight} kg` : "-- kg", 
      trend: "stable" 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Good Morning!</h1>
              <p className="text-primary-foreground/80">How are you feeling today?</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/doctors">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">Book Appointment</p>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Video className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Video Call</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Chat with Doctor</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">View Reports</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Appointments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
                    <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming" className="space-y-4 mt-4">
                    {upcomingAppointments.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No upcoming appointments</p>
                        <Link to="/doctors">
                          <Button className="mt-4">Book an Appointment</Button>
                        </Link>
                      </div>
                    ) : (
                      upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">
                              Dr. {appointment.doctor?.user?.full_name || 'Doctor'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.doctor?.specialty || 'Specialist'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="text-sm">
                                {appointment.appointment_date} at {appointment.appointment_time}
                              </span>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge 
                              variant={
                                appointment.status === 'confirmed' ? 'default' : 
                                appointment.status === 'rescheduled' ? 'secondary' : 'outline'
                              }
                            >
                              {appointment.status}
                            </Badge>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setRescheduleDialog(true);
                                }}
                              >
                                Reschedule
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setCancelDialog(true);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="past" className="space-y-4 mt-4">
                    {pastAppointments.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No past appointments</p>
                    ) : (
                      pastAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">
                              Dr. {appointment.doctor?.user?.full_name || 'Doctor'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.doctor?.specialty || 'Specialist'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {appointment.appointment_date} at {appointment.appointment_time}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{appointment.status}</Badge>
                            <Button size="sm" variant="ghost" className="mt-2">
                              View Details
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Health Stats */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Health Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {healthStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                    <Badge variant="secondary">{stat.trend}</Badge>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-4">
                  Record New Vitals
                </Button>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Don't forget your medication at 2 PM</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Follow-up appointment due next week</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog} onOpenChange={setRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Choose a new date and time for your appointment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Date</Label>
              <Input 
                type="date" 
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>New Time</Label>
              <Input 
                type="time" 
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReschedule}>
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>
              Keep Appointment
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
