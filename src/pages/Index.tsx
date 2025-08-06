import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Search, Calendar, Video, Shield, Star, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: Search,
      title: "Find Doctors",
      description: "Search and book appointments with verified doctors"
    },
    {
      icon: Video,
      title: "Video Consultation",
      description: "Consult with doctors from the comfort of your home"
    },
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Book appointments in just a few clicks"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is completely secure and private"
    }
  ];

  const stats = [
    { icon: Users, value: "50,000+", label: "Happy Patients" },
    { icon: Heart, value: "1,000+", label: "Verified Doctors" },
    { icon: Clock, value: "24/7", label: "Support Available" },
    { icon: Star, value: "4.8", label: "Average Rating" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-full">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary">HealyLink</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Your Health, <span className="text-primary">Our Priority</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with qualified doctors, book appointments instantly, and get the care you deserve - all from your smartphone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/doctors">
              <Button size="lg" className="text-lg px-8">
                <Search className="h-5 w-5 mr-2" />
                Find Doctors
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8">
                <Heart className="h-5 w-5 mr-2" />
                Join HealyLink
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Why Choose HealyLink?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make healthcare accessible, convenient, and affordable for everyone.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-8">
            Join thousands of patients who trust HealyLink for their healthcare needs.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 HealyLink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
