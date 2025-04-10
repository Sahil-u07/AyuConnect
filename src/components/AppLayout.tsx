
import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Ambulance } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-2" onClick={() => navigate('/')} role="button">
            <Ambulance className="h-8 w-8 text-emergency" />
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-emergency">Ayu</span>
              <span className="text-gray-600">Connect</span>
            </h1>
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {user.name} ({user.role})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 AyuConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
