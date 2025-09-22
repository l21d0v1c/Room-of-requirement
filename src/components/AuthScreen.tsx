"use client";

import React from 'react';

interface AuthScreenProps {
  onAuthenticated: (config: { safeword: string; safecommand: string }) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  // Temporarily simplified to diagnose the "Unexpected token div" error
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <p>AuthScreen temporaire pour le diagnostic.</p>
    </div>
  );
};

export default AuthScreen;