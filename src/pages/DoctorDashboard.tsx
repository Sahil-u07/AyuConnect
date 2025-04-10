
import React from 'react';
import { useTracking } from '../contexts/TrackingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, Ambulance, Clock, AlertTriangle } from 'lucide-react';

const DoctorDashboard: React.FC = () => {
  const { ambulances } = useTracking();
  
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
        <Badge className="bg-emergency hover:bg-emergency/80">
          {activeAmbulances.length} Active Transport{activeAmbulances.length !== 1 && 's'}
        </Badge>
      </div>
      
      <Tabs defaultValue="incoming">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="incoming">Incoming Patients</TabsTrigger>
          <TabsTrigger value="vitals">Patient Vitals</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
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
        
        <TabsContent value="vitals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Patient Vitals Monitoring
              </CardTitle>
              <CardDescription>
                Real-time health metrics from active transports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {urgentCases.filter(a => a.patientVitals).length > 0 ? (
                <div className="space-y-6">
                  {urgentCases
                    .filter(a => a.patientVitals)
                    .map(ambulance => (
                      <div key={ambulance.id} className="border-b pb-4 last:border-0">
                        <h4 className="text-sm font-medium mb-3">
                          Patient ID: {ambulance.patientId} (Ambulance {ambulance.id})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {ambulance.patientVitals && Object.entries(ambulance.patientVitals).map(([key, value]) => {
                            let isAbnormal = false;
                            
                            // Simple check for abnormal values (would be more sophisticated in real app)
                            if (key === 'heartRate' && (Number(value) > 100 || Number(value) < 60)) isAbnormal = true;
                            if (key === 'oxygenLevel' && Number(value) < 95) isAbnormal = true;
                            if (key === 'temperature' && (Number(value) > 38 || Number(value) < 36)) isAbnormal = true;
                            
                            return (
                              <div key={key} className={`flex flex-col p-3 rounded-lg border ${isAbnormal ? 'border-emergency/50 bg-emergency/5' : ''}`}>
                                <div className="flex justify-between items-center">
                                  <span className="vital-value">{value}</span>
                                  {isAbnormal && <AlertTriangle className="h-4 w-4 text-emergency" />}
                                </div>
                                <span className="vital-label">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No active patient vitals to display
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Statistics</CardTitle>
              <CardDescription>
                Average response and transport times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <p>Statistics visualization will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;
