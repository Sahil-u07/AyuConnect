import React, { useEffect, useState } from 'react';
import { useTracking } from '../contexts/TrackingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, Ambulance, Clock, AlertTriangle, Users, BarChart, Heart, HeartPulse } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '../contexts/AuthContext';
import VitalsChart, { VitalDataPoint } from '@/components/VitalsChart';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Test data for patient statistics
const patientStats = {
  admittedToday: 8,
  dischargedToday: 5,
  waitingForBeds: 3,
  inTransit: 2
};

// Test data for doctor on-call schedule
const onCallSchedule = [
  { id: 1, name: "Dr. Johnson", specialty: "Emergency Medicine", startTime: "08:00", endTime: "20:00" },
  { id: 2, name: "Dr. Patel", specialty: "Trauma Surgery", startTime: "20:00", endTime: "08:00" },
  { id: 3, name: "Dr. Williams", specialty: "Cardiology", startTime: "12:00", endTime: "00:00" },
];

// Test data for recent patients
const recentPatients = [
  { id: "PAT-7832", name: "Emily Clark", age: 34, condition: "Trauma - MVA", status: "Critical", arrivalTime: "10:23 AM" },
  { id: "PAT-7836", name: "Robert Chen", age: 56, condition: "Chest Pain", status: "Stable", arrivalTime: "11:45 AM" },
  { id: "PAT-7841", name: "Sarah Johnson", age: 28, condition: "Respiratory Distress", status: "Serious", arrivalTime: "12:10 PM" },
  { id: "PAT-7844", name: "Michael Wong", age: 42, condition: "Fall Injury", status: "Stable", arrivalTime: "12:35 PM" },
];

// Generate initial heart rate data (last 15 minutes at 1 minute intervals)
const generateInitialHeartRateData = (): VitalDataPoint[] => {
  const data: VitalDataPoint[] = [];
  const now = new Date();
  
  for (let i = 15; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Generate somewhat realistic heart rate values
    const baseHeartRate = 72;  // Average resting heart rate
    const variation = Math.random() * 15 - 7.5;  // Random variation between -7.5 and +7.5
    data.push({
      time: timeString,
      value: Math.round(baseHeartRate + variation)
    });
  }
  
  return data;
};

// Generate initial SpO2 data
const generateInitialSpO2Data = (): VitalDataPoint[] => {
  const data: VitalDataPoint[] = [];
  const now = new Date();
  
  for (let i = 15; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Generate realistic SpO2 values (typically 95-100% for healthy individuals)
    const baseSpO2 = 98;  // Average SpO2
    const variation = Math.random() * 3 - 1;  // Random variation between -1 and +2
    data.push({
      time: timeString,
      value: Math.round(Math.min(100, Math.max(94, baseSpO2 + variation)))
    });
  }
  
  return data;
};

// Get all available patients to monitor (combining incoming and recent)
const getAllPatients = (ambulances) => {
  const incomingPatients = ambulances
    .filter(amb => amb.patientId && (amb.status === 'transporting' || amb.status === 'en-route' || amb.status === 'arrived'))
    .map(amb => ({ 
      id: amb.patientId, 
      name: `Ambulance ${amb.id} Patient`,
      status: amb.status === 'transporting' ? 'Critical' : 'En Route'
    }));

  return [...incomingPatients, ...recentPatients];
};

const DoctorDashboard: React.FC = () => {
  const { ambulances } = useTracking();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [heartRateData, setHeartRateData] = useState<VitalDataPoint[]>(generateInitialHeartRateData());
  const [spO2Data, setSpO2Data] = useState<VitalDataPoint[]>(generateInitialSpO2Data());
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const allPatients = getAllPatients(ambulances);
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Live heart rate monitoring effect - removed alerts
  useEffect(() => {
    if (!isMonitoring || !selectedPatientId) return;
    
    // Update heart rate every 3 seconds
    const heartRateInterval = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setHeartRateData(prevData => {
        // Get the last heart rate value as a base
        const lastValue = prevData[prevData.length - 1]?.value || 72;
        
        // Calculate new value with variation
        let newValue = lastValue + (Math.random() * 10 - 5); // Random variation between -5 and +5
        
        // Add occasional spikes for interest (10% chance)
        if (Math.random() < 0.1) {
          newValue += Math.random() < 0.5 ? 15 : -15;
        }
        
        newValue = Math.round(Math.max(40, Math.min(180, newValue))); // Keep within reasonable limits
        
        // Keep the last 15 points
        const newData = [...prevData.slice(-14), { time: timeString, value: newValue }];
        return newData;
      });
      
      // Also update SpO2 data
      setSpO2Data(prevData => {
        // Get the last SpO2 value as a base
        const lastValue = prevData[prevData.length - 1]?.value || 98;
        
        // Calculate new value with small variation
        let newValue = lastValue + (Math.random() * 2 - 1); // Random variation between -1 and +1
        
        // Keep SpO2 within realistic bounds
        newValue = Math.round(Math.min(100, Math.max(92, newValue)));
        
        // Keep the last 15 points
        const newData = [...prevData.slice(-14), { time: timeString, value: newValue }];
        return newData;
      });
      
    }, 3000);
    
    return () => clearInterval(heartRateInterval);
  }, [isMonitoring, selectedPatientId]);
  
  // Get ambulances with patients
  const activeAmbulances = ambulances.filter(amb => 
    amb.status === 'transporting' || amb.status === 'en-route' || amb.status === 'arrived'
  );
  
  // Sort ambulances by urgency (for demo, just sort by status)
  const urgentCases = [...activeAmbulances].sort((a, b) => {
    if (a.status === 'transporting' && b.status !== 'transporting') return -1;
    if (a.status !== 'transporting' && b.status === 'transporting') return 1;
    return 0;
  });

  // Format current time for display
  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  // Find selected patient details
  const selectedPatient = allPatients.find(p => p.id === selectedPatientId);

  // Handle starting monitoring for a patient
  const handleStartMonitoring = (patientId: string) => {
    setSelectedPatientId(patientId);
    setIsMonitoring(true);
    toast.success(`Started monitoring patient ${patientId}`);
  };

  // Handle stopping monitoring
  const handleStopMonitoring = () => {
    setIsMonitoring(false);
    toast.info(`Stopped monitoring patient ${selectedPatientId}`);
  };
  
  // Handle patient selection from dropdown
  const handlePatientSelect = (patientId: string) => {
    if (isMonitoring && selectedPatientId === patientId) {
      // If already monitoring this patient, stop monitoring
      handleStopMonitoring();
    } else {
      // Start monitoring new patient
      handleStartMonitoring(patientId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || "Doctor"}</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPatientId || ""} onValueChange={handlePatientSelect}>
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Select patient to monitor" />
            </SelectTrigger>
            <SelectContent>
              {allPatients.map(patient => (
                <SelectItem key={patient.id} value={patient.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{patient.name} ({patient.id})</span>
                    {patient.status === 'Critical' && 
                      <Badge className="ml-2 bg-emergency">Critical</Badge>
                    }
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="text-right">
            <p className="text-lg font-medium">{formattedTime}</p>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
      </div>
      
      {/* Live monitoring section - only shown when monitoring is active */}
      {isMonitoring && selectedPatientId && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-red-500" />
              Live Monitoring - {selectedPatient?.name || `Patient ${selectedPatientId}`}
            </h2>
            <button 
              onClick={handleStopMonitoring}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Stop Monitoring
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <VitalsChart
              title="Heart Rate"
              data={heartRateData}
              unit="bpm"
              normalRange={{ min: 60, max: 100 }}
              color="#dc2626"
              className="col-span-1"
            />
            
            <VitalsChart
              title="Oxygen Saturation"
              data={spO2Data}
              unit="%"
              normalRange={{ min: 95, max: 100 }}
              color="#2563eb"
              className="col-span-1"
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Patient Vitals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Blood Pressure</p>
                  <p className="text-lg font-semibold">120/80 mmHg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Oxygen Level</p>
                  <p className="text-lg font-semibold">{spO2Data[spO2Data.length - 1]?.value || 98}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="text-lg font-semibold">37.2°C</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Respiratory Rate</p>
                  <p className="text-lg font-semibold">16 rpm</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{patientStats.admittedToday + patientStats.inTransit}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">+{patientStats.inTransit} incoming</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Ambulance className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{activeAmbulances.length}</span>
            </div>
            <Badge className="mt-1 bg-emergency hover:bg-emergency/80">
              {activeAmbulances.filter(a => a.status === 'transporting').length} Critical
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Wait Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">18 min</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average wait time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bed Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">85%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{patientStats.waitingForBeds} patients waiting</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="incoming">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="incoming">Incoming Patients</TabsTrigger>
          <TabsTrigger value="recent">Recent Arrivals</TabsTrigger>
          <TabsTrigger value="staff">On-Call Staff</TabsTrigger>
        </TabsList>
        
        <TabsContent value="incoming" className="space-y-4">
          {urgentCases.length > 0 ? (
            urgentCases.map(ambulance => (
              <Card key={ambulance.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Ambulance {ambulance.id}
                        {ambulance.status === 'transporting' && (
                          <span className="pulse-dot"></span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Driver: {ambulance.driverName}
                      </CardDescription>
                    </div>
                    <Badge className={
                      ambulance.status === 'transporting' ? "bg-medical" : 
                      ambulance.status === 'en-route' ? "bg-warning" : 
                      "bg-success"
                    }>
                      {ambulance.status === 'transporting' ? 'En Route to Hospital' :
                       ambulance.status === 'en-route' ? 'Going to Patient' :
                       'At Patient Location'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>ETA: {ambulance.estimatedArrivalTime || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ambulance className="h-4 w-4 text-gray-500" />
                      <span>Patient ID: {ambulance.patientId || 'Unknown'}</span>
                    </div>
                    
                    {ambulance.patientVitals && (
                      <div className="col-span-2 mt-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Critical Vitals</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col p-2 bg-gray-50 rounded-md">
                            <span className="text-sm font-bold">{ambulance.patientVitals.heartRate} bpm</span>
                            <span className="text-xs text-gray-500">Heart Rate</span>
                          </div>
                          <div className="flex flex-col p-2 bg-gray-50 rounded-md">
                            <span className="text-sm font-bold">{ambulance.patientVitals.bloodPressure}</span>
                            <span className="text-xs text-gray-500">Blood Pressure</span>
                          </div>
                          <div className="flex flex-col p-2 bg-gray-50 rounded-md">
                            <span className="text-sm font-bold">{ambulance.patientVitals.oxygenLevel}%</span>
                            <span className="text-xs text-gray-500">SpO2</span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          {isMonitoring && selectedPatientId === ambulance.patientId ? (
                            <span className="text-sm text-green-500 flex items-center gap-1">
                              <HeartPulse className="h-4 w-4" />
                              Monitoring
                            </span>
                          ) : (
                            <button 
                              className="text-sm text-blue-500 hover:text-blue-700"
                              onClick={() => handleStartMonitoring(ambulance.patientId || 'unknown')}
                            >
                              Start Monitoring
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <span className="text-gray-500">No incoming patients at the moment</span>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Patient Arrivals</CardTitle>
              <CardDescription>
                Patients admitted within the last 4 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Arrival Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.id}</TableCell>
                      <TableCell>{patient.name}, {patient.age}</TableCell>
                      <TableCell>{patient.condition}</TableCell>
                      <TableCell>
                        <Badge className={
                          patient.status === 'Critical' ? "bg-emergency" : 
                          patient.status === 'Serious' ? "bg-warning" : 
                          "bg-success"
                        }>
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{patient.arrivalTime}</TableCell>
                      <TableCell>
                        {isMonitoring && selectedPatientId === patient.id ? (
                          <button
                            onClick={handleStopMonitoring}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Stop Monitoring
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartMonitoring(patient.id)}
                            className="text-sm text-blue-500 hover:text-blue-700"
                          >
                            Monitor Vitals
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>On-Call Schedule</CardTitle>
              <CardDescription>
                Emergency department staff currently on duty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {onCallSchedule.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>{doctor.specialty}</TableCell>
                      <TableCell>{doctor.startTime} - {doctor.endTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;
