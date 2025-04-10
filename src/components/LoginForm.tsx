
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password, role);
      
      // Redirect based on role
      if (role === "patient") {
        navigate("/patient");
      } else if (role === "driver") {
        navigate("/driver");
      } else if (role === "doctor") {
        navigate("/doctor");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    const email = role === "patient" ? "patient@example.com" : 
                  role === "driver" ? "driver@example.com" : 
                  "doctor@example.com";
    
    setEmail(email);
    setRole(role);
    setPassword("password"); // Any password works for demo
    
    // Submit the form after setting the values
    login(email, "password", role)
      .then(() => {
        navigate(`/${role}`);
        toast.success(`Logged in as ${role}`);
      })
      .catch(error => {
        console.error("Login error:", error);
      });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Choose your role and enter your credentials
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <RadioGroup
              value={role}
              onValueChange={(value) => setRole(value as UserRole)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="patient" id="patient" />
                <Label htmlFor="patient">Patient</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="driver" id="driver" />
                <Label htmlFor="driver">Ambulance Driver</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="doctor" id="doctor" />
                <Label htmlFor="doctor">Doctor</Label>
              </div>
            </RadioGroup>
            
            <div className="text-sm text-muted-foreground mt-3">
              <p>For demo purposes:</p>
              <ul className="list-disc list-inside ml-2">
                <li>Patient: patient@example.com</li>
                <li>Driver: driver@example.com</li>
                <li>Doctor: doctor@example.com</li>
              </ul>
              <p>(Any password will work)</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="w-full border-t pt-4">
            <p className="text-sm text-center mb-2">Quick Access Buttons</p>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickLogin("patient")}
              >
                Patient
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickLogin("driver")}
              >
                Driver
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickLogin("doctor")}
              >
                Doctor
              </Button>
            </div>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};
