
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Ambulance, Heart, Activity, Clock } from 'lucide-react';

const features = [
  {
    icon: <Ambulance className="h-12 w-12 text-emergency" />,
    title: "Rapid Response",
    description: "Book an ambulance with just a few taps and get immediate emergency medical assistance."
  },
  {
    icon: <Activity className="h-12 w-12 text-medical" />,
    title: "Real-time Vitals",
    description: "Monitor patient vitals during transport for better preparation at the hospital."
  },
  {
    icon: <Clock className="h-12 w-12 text-blue-500" />,
    title: "Live Tracking",
    description: "Track ambulance location in real-time with accurate ETA updates."
  },
  {
    icon: <Heart className="h-12 w-12 text-emergency" />,
    title: "Seamless Communication",
    description: "Direct communication between patients, ambulance staff, and hospital doctors."
  }
];

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          <span className="text-emergency">Rescue</span>
          <span className="text-gray-800">Route</span>
          <span className="text-gray-600"> Tracker</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connecting patients, ambulances, and hospitals for faster emergency response and better outcomes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/login')}
            className="bg-emergency hover:bg-emergency/90"
          >
            Get Started
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/about')}
          >
            Learn More
          </Button>
        </div>
      </section>
      
      {/* Features Section */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      {/* User Types Section */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8">For Different Users</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-emergency/5 to-emergency/10 border-emergency/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="p-2 rounded-full bg-emergency/10">👤</span> 
                Patients
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-emergency">✓</span> Quick ambulance booking
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emergency">✓</span> Real-time ambulance tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emergency">✓</span> Estimated arrival notifications
                </li>
              </ul>
              <Button variant="link" onClick={() => navigate('/login')} className="text-emergency p-0">
                Patient Login →
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-medical/5 to-medical/10 border-medical/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="p-2 rounded-full bg-medical/10">🚑</span> 
                Ambulance Drivers
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-medical">✓</span> Navigation assistance
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-medical">✓</span> Patient vitals recording
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-medical">✓</span> Hospital communication
                </li>
              </ul>
              <Button variant="link" onClick={() => navigate('/login')} className="text-medical p-0">
                Driver Login →
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="p-2 rounded-full bg-blue-500/10">👩‍⚕️</span> 
                Hospital Doctors
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span> Live patient vitals monitoring
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span> Incoming patients dashboard
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span> Resource management
                </li>
              </ul>
              <Button variant="link" onClick={() => navigate('/login')} className="text-blue-500 p-0">
                Doctor Login →
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
