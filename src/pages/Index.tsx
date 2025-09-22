import React, { useState } from 'react';
import AuthScreen from '@/components/AuthScreen';
import VirtualAssistant from '@/components/VirtualAssistant';
import { clearConfig } from '@/utils/storage';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ninaConfig, setNinaConfig] = useState<{ safeword: string; safecommand: string } | null>(null);

  const handleAuthenticated = (config: { safeword: string; safecommand: string }) => {
    setNinaConfig(config);
    setIsAuthenticated(true);
  };

  const handleShutdown = () => {
    clearConfig(); // Clear config on shutdown
    setIsAuthenticated(false);
    setNinaConfig(null);
    // Optionally, force a page reload to ensure full reset
    window.location.reload();
  };

  return (
    <>
      {isAuthenticated && ninaConfig ? (
        <VirtualAssistant
          safeword={ninaConfig.safeword}
          safecommand={ninaConfig.safecommand}
          onShutdown={handleShutdown}
        />
      ) : (
        <AuthScreen onAuthenticated={handleAuthenticated} />
      )}
    </>
  );
};

export default Index;