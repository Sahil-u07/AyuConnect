
import React, { useEffect, useState } from 'react';
import { useTracking } from '../contexts/TrackingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, Ambulance, Clock, AlertTriangle, Users, BarChart } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '../contexts/AuthContext';

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

const DoctorDashboard: React.FC = () => {
  const { ambulances } = useTracking();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || "Doctor"}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-medium">{formattedTime}</p>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
      </div>
      
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
