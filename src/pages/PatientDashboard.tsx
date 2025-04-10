
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTracking } from '../contexts/TrackingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Ambulance, MapPin, Heart, Clock, MapIcon, Navigation } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { bookAmbulance, getPatientAmbulance, getNearbyAmbulances } = useTracking();
  const [isBooking, setIsBooking] = useState(false);
  
  // Use mock current location
  const currentLocation = { latitude: 40.7128, longitude: -74.006 };
  
  // Get current booked ambulance if any
  const bookedAmbulance = user ? getPatientAmbulance(user.id) : undefined;
  
  // Get nearby available ambulances
  const nearbyAmbulances = getNearbyAmbulances(currentLocation);
  
  const handleBookAmbulance = async () => {
    if (!user) return;
    
    setIsBooking(true);
    try {
      await bookAmbulance(user.id, currentLocation);
      toast.success('Ambulance booked successfully!');
    } catch (error) {
      toast.error('Failed to book ambulance. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setIsBooking(false);
    }
  };
  
  const getStatusDisplay = () => {
    if (!bookedAmbulance) return null;
    
    switch (bookedAmbulance.status) {
      case 'en-route':
        return {
          title: 'Ambulance on the way',
          description: `ETA: ${bookedAmbulance.estimatedArrivalTime}`,
          icon: <Clock className="h-8 w-8 text-warning" />
        };
      case 'arrived':
        return {
          title: 'Ambulance has arrived',
          description: 'Please prepare to board',
          icon: <MapPin className="h-8 w-8 text-success" />
        };
      case 'transporting':
        return {
          title: 'En route to hospital',
          description: `ETA: ${bookedAmbulance.estimatedArrivalTime}`,
          icon: <Ambulance className="h-8 w-8 text-emergency animate-pulse" />
        };
      case 'at-hospital':
        return {
          title: 'Arrived at hospital',
          description: 'Medical staff notified',
          icon: <Heart className="h-8 w-8 text-success" />
        };
      default:
        return null;
    }
  };
  
  const statusInfo = getStatusDisplay();

  // Calculate estimated distance - in a real app, this would use geolocation calculations
  const calculateDistance = (ambulanceLocation: { latitude: number, longitude: number }) => {
    // Simple mock distance calculation
    const latDiff = Math.abs(currentLocation.latitude - ambulanceLocation.latitude);
    const lonDiff = Math.abs(currentLocation.longitude - ambulanceLocation.longitude);
    
    // Convert to approx kilometers - this is just for demonstration
    const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111;
    return distance.toFixed(1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Patient Dashboard</h1>
      
      {!bookedAmbulance ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Emergency Assistance</CardTitle>
              <CardDescription>
                Request an ambulance to your current location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="text-gray-500" size={18} />
                  <span>123 Main Street, New York, NY</span>
                </div>
                <Button 
                  onClick={handleBookAmbulance} 
                  disabled={isBooking}
                  className="w-full bg-emergency hover:bg-emergency/90"
                >
                  {isBooking ? 'Booking...' : 'Book Ambulance Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Available Ambulances Section */}
          <Card>
            <CardHeader>
              <CardTitle>Available Ambulances Nearby</CardTitle>
              <CardDescription>
                {nearbyAmbulances.length} ambulances in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>ETA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nearbyAmbulances.map((ambulance) => (
                    <TableRow key={ambulance.id}>
                      <TableCell className="font-medium">{ambulance.id}</TableCell>
                      <TableCell>{ambulance.driverName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Navigation size={16} className="text-gray-500" />
                          {calculateDistance(ambulance.location)} km
                        </div>
                      </TableCell>
                      <TableCell>~{Math.ceil(Number(calculateDistance(ambulance.location)) * 2)} mins</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            {statusInfo?.icon}
            <div>
              <CardTitle>{statusInfo?.title}</CardTitle>
              <CardDescription>{statusInfo?.description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-500">Driver</span>
                <span>{bookedAmbulance.driverName}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-500">Ambulance ID</span>
                <span>{bookedAmbulance.id}</span>
              </div>
              <div className="rounded-lg bg-gray-100 p-4 flex justify-center items-center h-48">
                <MapIcon className="h-16 w-16 text-gray-400" />
                <p className="text-gray-500">Map view will display here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientDashboard;
