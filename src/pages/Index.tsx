import React, { useState } from 'react';
import AuthScreen from '@/components/AuthScreen';
import VirtualAssistant from '@/components/VirtualAssistant';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { clearConfig } from '@/utils/storage';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ninaConfig, setNinaConfig] = useState<{ safeword: string; safecommand: string } | null>(null);

  const handleAuthenticated = (config: { safeword: string; safecommand: string }) => {
    setNinaConfig(config);
    setIsAuthenticated(true);
  };

  const handleShutdown = () => {
    setIsAuthenticated(false);
    setNinaConfig(null);
    // Optionally clear config on shutdown, or just log out
    // clearConfig(); // Uncomment if you want to clear config on every shutdown
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {!isAuthenticated ? (
          <AuthScreen onAuthenticated={handleAuthenticated} />
        ) : (
          ninaConfig && (
            <VirtualAssistant
              safeword={ninaConfig.safeword}
              safecommand={ninaConfig.safecommand}
              onShutdown={handleShutdown}
            />
          )
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;