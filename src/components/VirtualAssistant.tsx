import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, PowerOff } from 'lucide-react';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

interface VirtualAssistantProps {
  safeword: string;
  safecommand: string;
  onShutdown: () => void;
}

const VirtualAssistant: React.FC<VirtualAssistantProps> = ({ safeword, safecommand, onShutdown }) => {
  const [ninaResponse, setNinaResponse] = useState<string>("Que puis-je faire pour vous monsieur ?");
  const [isNinaActive, setIsNinaActive] = useState<boolean>(false); // Nina is active after "Nina" is said
  const { transcript, isListening, startListening, stopListening, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      showError("Votre navigateur ne supporte pas la reconnaissance vocale. Nina ne pourra pas écouter vos commandes.");
    }
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    if (!isListening && transcript) {
      console.log("Transcript:", transcript);
      processCommand(transcript);
      // Clear transcript after processing to avoid re-processing the same command
      // This is handled internally by useSpeechRecognition now, but good to keep in mind.
    }
  }, [transcript, isListening]);

  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();

    // Check for safeword/safecommand
    if (lowerCommand.includes(safeword.toLowerCase()) || lowerCommand.includes(safecommand.toLowerCase())) {
      setNinaResponse("Commande d'urgence détectée. Arrêt immédiat de l'application.");
      showError("Arrêt d'urgence activé !");
      setTimeout(onShutdown, 2000); // Shutdown after a short delay
      return;
    }

    if (lowerCommand.startsWith("nina")) {
      setIsNinaActive(true);
      const action = lowerCommand.replace("nina", "").trim();

      if (action === "") {
        setNinaResponse("Que puis-je faire pour vous monsieur ?");
      } else {
        executeAction(action);
      }
    } else {
      // If Nina is not active (i.e., "Nina" wasn't said first), ignore other commands
      if (isNinaActive) {
        setNinaResponse("Je n'ai pas compris votre demande. Veuillez répéter ou dire 'Nina' pour me réactiver.");
        setIsNinaActive(false); // Reset Nina's active state
      }
    }
  };

  const executeAction = (action: string) => {
    let response = "Je n'ai pas compris cette action, monsieur.";

    if (action.startsWith("va sur ")) {
      const url = action.replace("va sur ", "").trim();
      if (url) {
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        window.open(fullUrl, '_blank');
        response = `J'ouvre ${url} pour vous, monsieur.`;
        showSuccess(response);
      }
    } else if (action.startsWith("cherche ")) {
      const query = action.replace("cherche ", "").trim();
      if (query) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        response = `Je recherche "${query}" pour vous, monsieur.`;
        showSuccess(response);
      }
    } else if (action.includes("mot de passe")) {
      response = "Veuillez taper votre mot de passe monsieur.";
      showSuccess(response);
    } else if (action.includes("scroll down") || action.includes("descendre")) {
      // Simulate scrolling down - actual scrolling is complex for a web app without knowing context
      window.scrollBy({ top: window.innerHeight / 2, behavior: 'smooth' });
      response = "Je fais défiler la page vers le bas, monsieur.";
      showSuccess(response);
    } else if (action.includes("scroll up") || action.includes("remonter")) {
      window.scrollBy({ top: -window.innerHeight / 2, behavior: 'smooth' });
      response = "Je fais défiler la page vers le haut, monsieur.";
      showSuccess(response);
    }
    // Add more simulated web actions here

    setNinaResponse(response);
    setIsNinaActive(false); // Reset Nina's active state after executing an action
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      setNinaResponse("J'écoute, monsieur...");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Nina, votre assistante virtuelle</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center justify-center">
            <div className="relative">
              <Button
                onClick={toggleListening}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'
                }`}
                disabled={!browserSupportsSpeechRecognition}
              >
                {isListening ? <MicOff size={48} className="text-white" /> : <Mic size={48} className="text-white" />}
              </Button>
              {!browserSupportsSpeechRecognition && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-red-500 text-sm">
                  Microphone non disponible
                </div>
              )}
            </div>
          </div>
          <p className="text-xl font-medium text-gray-800 dark:text-gray-200">{ninaResponse}</p>
          {isListening && (
            <p className="text-sm text-muted-foreground">Vous avez dit : "{transcript}"</p>
          )}
          <Button variant="destructive" onClick={onShutdown} className="w-full mt-4">
            <PowerOff className="mr-2 h-4 w-4" /> Éteindre Nina
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VirtualAssistant;