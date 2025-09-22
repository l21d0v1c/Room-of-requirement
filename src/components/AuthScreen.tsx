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

// Helper function to normalize text for comparison (remove punctuation, extra spaces, convert to lowercase)
const normalizeText = (text: string) => {
  return text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\s]+/g, '').trim();
};

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [safeword, setSafeword] = useState('');
  const [safecommand, setSafecommand] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPasswordAttempt, setCurrentPasswordAttempt] = useState('');
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);
  const [voiceConfirmationText, setVoiceConfirmationText] = useState('');

  const { transcript, isListening, startListening, stopListening, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const expectedConfirmation = "oui, c'est moi";
  const normalizedExpectedConfirmation = normalizeText(expectedConfirmation);

  useEffect(() => {
    const config = loadConfig();
    if (config) {
      setIsConfigured(true);
    }
  }, []);

  useEffect(() => {
    if (showVoicePrompt) {
      const normalizedSpokenConfirmation = normalizeText(transcript);
      const normalizedTypedConfirmation = normalizeText(voiceConfirmationText);

      const spokenMatch = normalizedSpokenConfirmation.includes(normalizedExpectedConfirmation);
      const typedMatch = normalizedTypedConfirmation === normalizedExpectedConfirmation;

      if ((spokenMatch && !isListening && transcript) || typedMatch) {
        const config = loadConfig();
        if (config) {
          showSuccess("Authentification réussie ! Bienvenue, Monsieur.");
          setIsAuthenticated(true);
          onAuthenticated({ safeword: config.safeword, safecommand: config.safecommand });
        }
      } else if (transcript && !isListening && !spokenMatch) {
        showError("Réponse vocale incorrecte. Veuillez réessayer.");
        setShowVoicePrompt(false); // Reset to allow re-attempt
        setVoiceConfirmationText(''); // Clear text input
      }
    }
  }, [transcript, isListening, showVoicePrompt, voiceConfirmationText, onAuthenticated, normalizedExpectedConfirmation]);

  const handleSetup = () => {
    if (password !== confirmPassword) {
      showError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!password || !safeword || !safecommand) {
      showError("Veuillez remplir tous les champs de configuration.");
      return;
    }

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
      setVoiceConfirmationText(''); // Clear any previous text input
      setTimeout(() => {
        if (browserSupportsSpeechRecognition) {
          startListening();
        } else {
          showError(`Votre navigateur ne supporte pas la reconnaissance vocale. Veuillez taper '${expectedConfirmation}'.`);
        }
      }, 1000);
    } else {
      showError("Mot de passe incorrect.");
      setCurrentPasswordAttempt('');
    }
  };

  const handleVoiceConfirmationSubmit = () => {
    const normalizedTypedConfirmation = normalizeText(voiceConfirmationText);
    if (normalizedTypedConfirmation === normalizedExpectedConfirmation) {
      // The useEffect will handle the authentication
      // We just need to trigger the check by updating state or letting useEffect run
      // For now, just let useEffect handle it.
    } else {
      showError(`Réponse textuelle incorrecte. Veuillez taper '${expectedConfirmation}'.`);
      setVoiceConfirmationText('');
    }
  };

  if (isAuthenticated) {
    return null;
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
                  <div className="flex w-full items-center space-x-2 mt-4">
                    <Input
                      type="text"
                      placeholder={`Tapez '${expectedConfirmation}' ou parlez...`}
                      value={isListening ? transcript : voiceConfirmationText}
                      onChange={(e) => setVoiceConfirmationText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleVoiceConfirmationSubmit();
                        }
                      }}
                      disabled={isListening} // Disable typing while listening
                    />
                    <Button type="submit" onClick={handleVoiceConfirmationSubmit} disabled={isListening}>
                      Confirmer
                    </Button>
                  </div>
                  {browserSupportsSpeechRecognition && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {isListening ? "Écoute en cours..." : `Dites '${expectedConfirmation}' ou tapez-le.`}
                    </p>
                  )}
                  {!browserSupportsSpeechRecognition && (
                    <p className="text-red-500 mt-2">Votre navigateur ne supporte pas la reconnaissance vocale. Veuillez taper '{expectedConfirmation}'.</p>
                  )}
                  {browserSupportsSpeechRecognition && !isListening && (
                    <p className="text-sm text-yellow-600 mt-2">
                      Si le micro ne fonctionne pas, assurez-vous d'avoir autorisé l'accès au microphone dans les paramètres de votre navigateur.
                    </p>
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