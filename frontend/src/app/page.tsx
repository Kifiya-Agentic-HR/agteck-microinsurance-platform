'use client';

import { useState } from 'react';

import RegisterForm from '@/components/auth/Register';
import Footer from '@/components/footer/footer';
import AuthForm from '@/components/auth/AuthForm';

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-teal-50 to-green-100 p-4">
        {showLogin ? (
          <AuthForm onSwitch={() => setShowLogin(false)} />
        ) : (
          <RegisterForm onSwitch={() => setShowLogin(true)} />
        )}
      </div>

      
      <Footer />
    </div>
  );
}
