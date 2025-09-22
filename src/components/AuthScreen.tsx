import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import { saveConfig, loadConfig } from '@/utils/storage';
import { showSuccess, showError } from '@/utils/toast';

interface AuthScreenProps {
  onAuthenticated: (config: { safeword: string; safecommand: string }) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [safeword, setSafeword] = useState('');
  const [safecommand, setSafecommand] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPasswordAttempt, setCurrentPasswordAttempt] = useState('');
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);

  const { transcript, isListening, startListening, stopListening, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    const config = loadConfig();
    if (config) {
      setIsConfigured(true);
      // For simplicity, we're not storing safeword/safecommand in state here,
      // but passing them directly to onAuthenticated after successful login.
    }
  }, []);

  useEffect(() => {
    if (showVoicePrompt && transcript.toLowerCase().includes("oui, c'est moi") && isListening === false) {
      const config = loadConfig();
      if (config) {
        showSuccess("Authentification vocale réussie ! Bienvenue, Monsieur.");
        setIsAuthenticated(true);
        onAuthenticated({ safeword: config.safeword, safecommand: config.safecommand });
      }
    } else if (showVoicePrompt && transcript && !transcript.toLowerCase().includes("oui, c'est moi") && isListening === false) {
      showError("Réponse vocale incorrecte. Veuillez réessayer.");
      setShowVoicePrompt(false); // Reset to allow re-attempt
    }
  }, [transcript, isListening, showVoicePrompt, onAuthenticated]);

  const handleSetup = () => {
    if (password !== confirmPassword) {
      showError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!password || !safeword || !safecommand) {
      showError("Veuillez remplir tous les champs de configuration.");
      return;
    }

    // In a real app, hash the password securely. For this demo, we store it directly.
    saveConfig({ passwordHash: password, safeword, safecommand });
    setIsConfigured(true);
    showSuccess("Configuration enregistrée avec succès !");
    setPassword('');
    setConfirmPassword('');
    setSafeword('');
    setSafecommand('');
  };

  const handleLogin = () => {
    const config = loadConfig();
    if (config && config.passwordHash === currentPasswordAttempt) {
      showSuccess("Mot de passe correct. Nina vous salue.");
      setShowVoicePrompt(true);
      // Start listening for voice confirmation
      setTimeout(() => { // Give a small delay for the user to be ready
        if (browserSupportsSpeechRecognition) {
          startListening();
        } else {
          showError("Votre navigateur ne supporte pas la reconnaissance vocale. Impossible de confirmer.");
          // Fallback for no speech recognition, maybe auto-authenticate for demo purposes
          // For now, we'll just block it.
        }
      }, 1000);
    } else {
      showError("Mot de passe incorrect.");
      setCurrentPasswordAttempt('');
    }
  };

  if (isAuthenticated) {
    return null; // Render nothing, parent component will render VirtualAssistant
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Bienvenue à Nina</CardTitle>
          <CardDescription>
            {isConfigured ? "Veuillez vous connecter pour activer Nina." : "Configurez Nina pour la première utilisation."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!isConfigured ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="safeword">Safeword (mot d'urgence)</Label>
                <Input
                  id="safeword"
                  type="text"
                  value={safeword}
                  onChange={(e) => setSafeword(e.target.value)}
                  placeholder="Ex: Urgence"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="safecommand">Safecommand (commande d'urgence)</Label>
                <Input
                  id="safecommand"
                  type="text"
                  value={safecommand}
                  onChange={(e) => setSafecommand(e.target.value)}
                  placeholder="Ex: Arrête tout"
                  required
                />
              </div>
              <Button type="submit" className="w-full" onClick={handleSetup}>
                Configurer Nina
              </Button>
            </>
          ) : (
            <>
              {!showVoicePrompt ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={currentPasswordAttempt}
                      onChange={(e) => setCurrentPasswordAttempt(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" onClick={handleLogin}>
                    Se connecter
                  </Button>
                </>
              ) : (
                <div className="text-center">
                  <p className="mb-4 text-lg">"Bonjour, c'est Nina, est-ce bien monsieur?"</p>
                  <p className="text-sm text-muted-foreground">
                    {isListening ? "Écoute en cours..." : "Dites 'oui, c'est moi' pour confirmer."}
                  </p>
                  {!browserSupportsSpeechRecognition && (
                    <p className="text-red-500 mt-2">Votre navigateur ne supporte pas la reconnaissance vocale.</p>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthScreen;