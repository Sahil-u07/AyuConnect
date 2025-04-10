
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
}

interface PatientVitals {
  heartRate: number;
  bloodPressure: string;
  oxygenLevel: number;
  temperature: number;
  respiratoryRate: number;
  glucoseLevel: number;
  consciousness: string;
}

interface AmbulanceData {
  id: string;
  driverName: string;
  location: Location;
  status: 'available' | 'en-route' | 'arrived' | 'transporting' | 'at-hospital';
  estimatedArrivalTime?: string;
  patientId?: string;
  patientVitals?: PatientVitals;
}

interface TrackingContextType {
  ambulances: AmbulanceData[];
  bookAmbulance: (patientId: string, pickupLocation: Location) => Promise<AmbulanceData>;
  updateVitals: (ambulanceId: string, vitals: PatientVitals) => void;
  getPatientAmbulance: (patientId: string) => AmbulanceData | undefined;
  getNearbyAmbulances: (location: Location) => AmbulanceData[];
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

// Initial mock ambulance data
const initialAmbulances: AmbulanceData[] = [
  {
    id: 'amb-1',
    driverName: 'Dave Driver',
    location: { latitude: 40.7128, longitude: -74.006 },
    status: 'available',
  },
  {
    id: 'amb-2',
    driverName: 'Sarah Smith',
    location: { latitude: 40.7148, longitude: -74.008 },
    status: 'available',
  },
  {
    id: 'amb-3',
    driverName: 'Mike Johnson',
    location: { latitude: 40.7138, longitude: -74.002 },
    status: 'available',
  },
];

// Initial mock patient vitals
const initialVitals: PatientVitals = {
  heartRate: 85,
  bloodPressure: '120/80',
  oxygenLevel: 98,
  temperature: 37.2,
  respiratoryRate: 16,
  glucoseLevel: 90,
  consciousness: 'Alert',
};

export const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ambulances, setAmbulances] = useState<AmbulanceData[]>(initialAmbulances);

  // Simulate ambulance movement for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulances(prevAmbulances => 
        prevAmbulances.map(ambulance => {
          // Only update ambulances that are en-route or transporting
          if (ambulance.status === 'en-route' || ambulance.status === 'transporting') {
            return {
              ...ambulance,
              location: {
                latitude: ambulance.location.latitude + (Math.random() * 0.001 - 0.0005),
                longitude: ambulance.location.longitude + (Math.random() * 0.001 - 0.0005),
              },
              patientVitals: ambulance.patientVitals ? simulateVitalChanges(ambulance.patientVitals) : undefined,
            };
          }
          return ambulance;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Simulate small variations in patient vitals
  const simulateVitalChanges = (vitals: PatientVitals): PatientVitals => {
    const newHeartRate = Math.max(60, Math.min(100, vitals.heartRate + (Math.random() * 6 - 3)));
    const systolic = parseInt(vitals.bloodPressure.split('/')[0]);
    const diastolic = parseInt(vitals.bloodPressure.split('/')[1]);
    const newSystolic = Math.max(100, Math.min(140, systolic + (Math.random() * 6 - 3)));
    const newDiastolic = Math.max(60, Math.min(90, diastolic + (Math.random() * 4 - 2)));
    const newOxygenLevel = Math.max(94, Math.min(100, vitals.oxygenLevel + (Math.random() * 1 - 0.5)));
    
    return {
      ...vitals,
      heartRate: Math.round(newHeartRate),
      bloodPressure: `${Math.round(newSystolic)}/${Math.round(newDiastolic)}`,
      oxygenLevel: Math.round(newOxygenLevel * 10) / 10,
      temperature: Math.round((vitals.temperature + (Math.random() * 0.2 - 0.1)) * 10) / 10,
      respiratoryRate: Math.round(Math.max(12, Math.min(20, vitals.respiratoryRate + (Math.random() * 2 - 1)))),
    };
  };

  // Book an ambulance
  const bookAmbulance = async (patientId: string, pickupLocation: Location): Promise<AmbulanceData> => {
    // Find nearest available ambulance - in a real app, this would be more sophisticated
    const availableAmbulances = ambulances.filter(amb => amb.status === 'available');
    
    if (availableAmbulances.length === 0) {
      throw new Error('No ambulances available');
    }

    // Pick the first available one for demo
    const bookedAmbulance = availableAmbulances[0];
    
    // Update the ambulance data
    const updatedAmbulance = {
      ...bookedAmbulance,
      status: 'en-route' as const,
      estimatedArrivalTime: new Date(Date.now() + 10 * 60000).toLocaleTimeString(), // 10 min from now
      patientId,
      patientVitals: initialVitals,
    };

    // Update the ambulances array
    setAmbulances(prevAmbulances => 
      prevAmbulances.map(amb => 
        amb.id === bookedAmbulance.id ? updatedAmbulance : amb
      )
    );

    // Simulate status changes
    simulateAmbulanceJourney(updatedAmbulance.id);
    
    return updatedAmbulance;
  };

  // Simulate ambulance status changes over time
  const simulateAmbulanceJourney = (ambulanceId: string) => {
    // Arrived at patient location after 10 seconds
    setTimeout(() => {
      setAmbulances(prevAmbulances => 
        prevAmbulances.map(amb => 
          amb.id === ambulanceId ? { ...amb, status: 'arrived' as const } : amb
        )
      );
      
      // Start transporting after another 10 seconds
      setTimeout(() => {
        setAmbulances(prevAmbulances => 
          prevAmbulances.map(amb => 
            amb.id === ambulanceId ? { 
              ...amb, 
              status: 'transporting' as const,
              estimatedArrivalTime: new Date(Date.now() + 15 * 60000).toLocaleTimeString() // 15 min to hospital
            } : amb
          )
        );
        
        // Arrive at hospital after another 15 seconds
        setTimeout(() => {
          setAmbulances(prevAmbulances => 
            prevAmbulances.map(amb => 
              amb.id === ambulanceId ? { 
                ...amb, 
                status: 'at-hospital' as const,
                patientId: undefined,
                patientVitals: undefined
              } : amb
            )
          );
          
          // Reset to available after another 10 seconds
          setTimeout(() => {
            setAmbulances(prevAmbulances => 
              prevAmbulances.map(amb => 
                amb.id === ambulanceId ? { 
                  ...amb, 
                  status: 'available' as const,
                  estimatedArrivalTime: undefined
                } : amb
              )
            );
          }, 10000);
        }, 15000);
      }, 10000);
    }, 10000);
  };

  // Update patient vitals
  const updateVitals = (ambulanceId: string, vitals: PatientVitals) => {
    setAmbulances(prevAmbulances => 
      prevAmbulances.map(amb => 
        amb.id === ambulanceId ? { ...amb, patientVitals: vitals } : amb
      )
    );
  };

  // Get ambulance assigned to a patient
  const getPatientAmbulance = (patientId: string): AmbulanceData | undefined => {
    return ambulances.find(amb => amb.patientId === patientId);
  };

  // Get nearby ambulances - in a real app would use geospatial queries
  const getNearbyAmbulances = (location: Location): AmbulanceData[] => {
    return ambulances.filter(amb => amb.status === 'available');
  };

  return (
    <TrackingContext.Provider value={{ 
      ambulances,
      bookAmbulance,
      updateVitals,
      getPatientAmbulance,
      getNearbyAmbulances,
    }}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (context === undefined) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
};
