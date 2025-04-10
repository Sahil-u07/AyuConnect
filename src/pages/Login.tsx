
import React from 'react';
import { LoginForm } from '../components/LoginForm';

const Login: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-emergency">Ayu</span>
            <span className="text-gray-800">Connect</span>
          </h1>
          <p className="text-gray-600 mt-2">Emergency Healthcare Connectivity Platform</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
