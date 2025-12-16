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
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Brain,
  LogOut,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("today");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingReviews: 0,
    activePatients: 0,
    criticalAlerts: 0
  });
  const navigate = useNavigate();
  const { user, role, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && (!user || role !== 'doctor')) {
      navigate('/auth');
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchAlerts();
    }
  }, [user]);

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', user?.id)
      .order('appointment_date', { ascending: true });
    if (error) {
      console.error('Error fetching appointments:', error);
    } else {
      setAppointments(data || []);
      const today = new Date().toISOString().split('T')[0];
      setStats(prev => ({
        ...prev,
        todayAppointments: data?.filter(a => a.appointment_date === today).length || 0,
        activePatients: new Set(data?.map(a => a.patient_id)).size || 0
      }));
    }
  };

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('doctor_id', user?.id)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching alerts:', error);
    } else {
      setAlerts(data || []);
      setStats(prev => ({
        ...prev,
        criticalAlerts: data?.filter(a => a.severity === 'critical' || a.severity === 'high').length || 0
      }));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);

    if (error) {
      toast.error('Failed to update appointment status');
    } else {
      toast.success('Appointment status updated');
      fetchAppointments();
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.appointment_date === today);
  const upcomingAppointments = appointments.filter(a => a.appointment_date > today && a.status !== 'cancelled');

  // Mock data for AI recommendations
  const aiRecommendations = [
    {
      id: 1,
      patient: "John Smith",
      diagnosis: "Type 2 Diabetes",
      recommendation: "Consider adding Metformin to treatment plan",
      confidence: 0.92,
      status: "pending"
    },
    {
      id: 2,
      patient: "Sarah Johnson",
      diagnosis: "Hypertension",
      recommendation: "Recommend lifestyle changes and follow-up in 2 weeks",
      confidence: 0.88,
      status: "pending"
    }
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
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
              <p className="text-primary-foreground/80">Welcome back, Doctor</p>
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

      <div className="max-w-7xl mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.todayAppointments}</p>
                  <p className="text-sm text-muted-foreground">Today's Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Brain className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{aiRecommendations.length}</p>
                  <p className="text-sm text-muted-foreground">AI Recommendations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activePatients}</p>
                  <p className="text-sm text-muted-foreground">Active Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.criticalAlerts}</p>
                  <p className="text-sm text-muted-foreground">Critical Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Appointments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="today">Today ({todayAppointments.length})</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="today" className="space-y-4 mt-4">
                    {todayAppointments.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No appointments scheduled for today</p>
                    ) : (
                      todayAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{appointment.patient?.full_name || 'Patient'}</h4>
                            <p className="text-sm text-muted-foreground">{appointment.reason_for_visit || 'General Consultation'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="text-sm">{appointment.appointment_time}</span>
                              <Badge variant="outline" className="ml-2">{appointment.consultation_type}</Badge>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge 
                              variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                            >
                              {appointment.status}
                            </Badge>
                            <div className="flex gap-1">
                              <Button size="icon" variant="outline" className="h-8 w-8">
                                <Video className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="outline" className="h-8 w-8">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="upcoming" className="space-y-4 mt-4">
                    {upcomingAppointments.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No upcoming appointments</p>
                    ) : (
                      upcomingAppointments.slice(0, 5).map((appointment) => (
                        <div key={appointment.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{appointment.patient?.full_name || 'Patient'}</h4>
                            <p className="text-sm text-muted-foreground">{appointment.reason_for_visit || 'General Consultation'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{appointment.appointment_date} at {appointment.appointment_time}</span>
                            </div>
                          </div>
                          <Badge variant="secondary">{appointment.status}</Badge>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* AI Therapy Recommendations */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-amber-500" />
                  AI Therapy Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiRecommendations.map((rec) => (
                  <div key={rec.id} className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{rec.patient}</h4>
                          <Badge variant="outline">{rec.diagnosis}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{rec.recommendation}</p>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">AI Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Patient Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Patient Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No active alerts</p>
                ) : (
                  alerts.slice(0, 5).map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-3 rounded-lg border ${
                        alert.severity === 'critical' ? 'bg-destructive/10 border-destructive/20' :
                        alert.severity === 'high' ? 'bg-amber-500/10 border-amber-500/20' :
                        'bg-muted'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                          alert.severity === 'critical' ? 'text-destructive' :
                          alert.severity === 'high' ? 'text-amber-500' :
                          'text-muted-foreground'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                        </div>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Mock alerts if no real data */}
                {alerts.length === 0 && (
                  <>
                    <div className="p-3 rounded-lg border bg-destructive/10 border-destructive/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Missed Therapy Session</p>
                          <p className="text-xs text-muted-foreground mt-1">Patient John D. missed physical therapy</p>
                        </div>
                        <Badge variant="destructive" className="text-xs">high</Badge>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border bg-amber-500/10 border-amber-500/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Abnormal Vitals</p>
                          <p className="text-xs text-muted-foreground mt-1">Sarah M.'s BP reading is elevated</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">medium</Badge>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Consultations This Week</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Patient Satisfaction</span>
                  <span className="font-semibold text-green-600">4.8/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Treatment Success Rate</span>
                  <span className="font-semibold text-green-600">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Follow-up Compliance</span>
                  <span className="font-semibold">85%</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Write Prescription
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  View All Patients
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
