
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTracking } from '../contexts/TrackingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MapIcon, Users, Activity, Navigation } from 'lucide-react';

const VITAL_FIELDS = [
  { id: 'heartRate', label: 'Heart Rate', unit: 'bpm' },
  { id: 'bloodPressure', label: 'Blood Pressure', unit: 'mmHg' },
  { id: 'oxygenLevel', label: 'Oxygen Level', unit: '%' },
  { id: 'temperature', label: 'Temperature', unit: '°C' },
  { id: 'respiratoryRate', label: 'Respiratory Rate', unit: 'breaths/min' },
  { id: 'glucoseLevel', label: 'Glucose Level', unit: 'mg/dL' },
  { id: 'consciousness', label: 'Consciousness', unit: '' },
];

interface VitalFormProps {
  ambulanceId: string;
  initialVitals?: any;
  onSubmit: () => void;
}

const VitalForm: React.FC<VitalFormProps> = ({ ambulanceId, initialVitals, onSubmit }) => {
  const { updateVitals } = useTracking();
  const [vitals, setVitals] = useState(initialVitals || {});

  const handleVitalChange = (id: string, value: string) => {
    setVitals(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateVitals(ambulanceId, vitals);
    toast.success('Patient vitals updated');
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {VITAL_FIELDS.map(field => (
        <div key={field.id} className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor={field.id}>{field.label}</Label>
          <Input
            id={field.id}
            value={vitals[field.id] || ''}
            onChange={e => handleVitalChange(field.id, e.target.value)}
            className="col-span-2"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        </div>
      ))}
      <Button type="submit" className="w-full">Update Vitals</Button>
    </form>
  );
};

const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const { ambulances } = useTracking();
  const [showVitalForm, setShowVitalForm] = useState(false);
  
  // Find ambulance assigned to this driver
  const driverAmbulance = user ? 
    ambulances.find(amb => amb.driverName === user.name) :
    undefined;

  const isAssignedToPatient = driverAmbulance && driverAmbulance.patientId;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Driver Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ambulance Status</CardTitle>
            <CardDescription>
              Your current assignment information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">ID:</span>
              <span>{driverAmbulance?.id || 'Not assigned'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                driverAmbulance?.status === 'available' ? 'bg-green-100 text-green-800' :
                driverAmbulance?.status === 'en-route' ? 'bg-yellow-100 text-yellow-800' :
                driverAmbulance?.status === 'transporting' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {driverAmbulance?.status || 'Unknown'}
              </span>
            </div>
            {isAssignedToPatient && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Patient ID:</span>
                <span>{driverAmbulance.patientId}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-medium">Current Location:</span>
              <span>
                {driverAmbulance ? 
                  `${driverAmbulance.location.latitude.toFixed(4)}, ${driverAmbulance.location.longitude.toFixed(4)}` : 
                  'Unknown'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Navigation</CardTitle>
                <CardDescription>
                  Route to patient or hospital
                </CardDescription>
              </div>
              <Navigation className="h-8 w-8 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-gray-100 p-4 flex justify-center items-center h-40">
              <MapIcon className="h-16 w-16 text-gray-400" />
              <p className="text-gray-500">Map navigation will display here</p>
            </div>
          </CardContent>
        </Card>

        {isAssignedToPatient && (
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle>Patient Vitals</CardTitle>
                <CardDescription>
                  Monitor and update patient medical information
                </CardDescription>
              </div>
              <Activity className="h-6 w-6 text-emergency" />
            </CardHeader>
            <CardContent>
              {!showVitalForm ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {driverAmbulance?.patientVitals && Object.entries(driverAmbulance.patientVitals).map(([key, value]) => (
                    <div key={key} className="flex flex-col p-4 border rounded-lg">
                      <span className="vital-value">{value}</span>
                      <span className="vital-label">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                driverAmbulance && (
                  <VitalForm 
                    ambulanceId={driverAmbulance.id}
                    initialVitals={driverAmbulance.patientVitals}
                    onSubmit={() => setShowVitalForm(false)}
                  />
                )
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant={showVitalForm ? "outline" : "default"}
                onClick={() => setShowVitalForm(!showVitalForm)}
                className="w-full"
              >
                {showVitalForm ? 'Cancel' : 'Update Patient Vitals'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
