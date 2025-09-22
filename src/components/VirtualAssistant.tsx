import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, PowerOff, Send } from 'lucide-react';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import { showSuccess, showError } from '@/utils/toast';

interface VirtualAssistantProps {
  safeword: string;
  safecommand: string;
  onShutdown: () => void;
}

const VirtualAssistant: React.FC<VirtualAssistantProps> = ({ safeword, safecommand, onShutdown }) => {
  const [ninaResponse, setNinaResponse] = useState<string>("Dites 'Nina' ou cliquez sur le micro pour m'activer.");
  const [isNinaActive, setIsNinaActive] = useState<boolean>(false);
  const [textCommand, setTextCommand] = useState<string>('');
  const [isProcessingCommand, setIsProcessingCommand] = useState<boolean>(false);
  const { transcript, isListening, startListening, stopListening, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // Memoize processCommand to prevent unnecessary re-renders and issues with useEffect dependencies
  const processCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase();
    let response = "Je n'ai pas compris cette action, monsieur.";

    // Safeword/safecommand check always takes precedence
    if (lowerCommand.includes(safeword.toLowerCase()) || lowerCommand.includes(safecommand.toLowerCase())) {
      response = "Commande d'urgence détectée. Arrêt immédiat de l'application.";
      setNinaResponse(response);
      showError("Arrêt d'urgence activé !");
      setTimeout(onShutdown, 2000);
      setIsProcessingCommand(false);
      return;
    }

    // Process general commands when Nina is active
    if (isNinaActive) {
      if (lowerCommand.startsWith("va sur ")) {
        const url = lowerCommand.replace("va sur ", "").trim();
        if (url) {
          const fullUrl = url.startsWith('http') ? url : `https://${url}`;
          window.open(fullUrl, '_blank');
          response = `J'ouvre ${url} pour vous, monsieur.`;
          showSuccess(response);
        }
      } else if (lowerCommand.startsWith("cherche ")) {
        const query = lowerCommand.replace("cherche ", "").trim();
        if (query) {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
          response = `Je recherche "${query}" pour vous, monsieur.`;
          showSuccess(response);
        }
      } else if (lowerCommand.includes("mot de passe")) {
        response = "Veuillez taper votre mot de passe monsieur.";
        showSuccess(response);
      } else if (lowerCommand.includes("scroll down") || lowerCommand.includes("descendre")) {
        window.scrollBy({ top: window.innerHeight / 2, behavior: 'smooth' });
        response = "Je fais défiler la page vers le bas, monsieur.";
        showSuccess(response);
      } else if (lowerCommand.includes("scroll up") || lowerCommand.includes("remonter")) {
        window.scrollBy({ top: -window.innerHeight / 2, behavior: 'smooth' });
        response = "Je fais défiler la page vers le haut, monsieur.";
        showSuccess(response);
      }
      // Add more simulated web actions here
    } else {
      response = "Veuillez dire 'Nina' pour m'activer, monsieur.";
    }

    setNinaResponse(response);
    setIsProcessingCommand(false);
    // Always restart listening after processing a command if Nina is active
    // This ensures continuous listening for subsequent commands
    if (isNinaActive) {
      startListening();
    }
  }, [safeword, safecommand, onShutdown, isNinaActive, startListening]);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      showError("Votre navigateur ne supporte pas la reconnaissance vocale. Nina ne pourra pas écouter vos commandes.");
    } else {
      // Attempt to start listening immediately for the activation word "Nina"
      // This is the "no-click" attempt. Browser might block it, but we try.
      startListening();
    }
    // Cleanup function to stop listening when component unmounts
    return () => {
      stopListening();
    };
  }, [browserSupportsSpeechRecognition, startListening, stopListening]); // Dependencies for initial listening

  useEffect(() => {
    if (isListening) {
      setTextCommand(transcript);
      setIsProcessingCommand(false);
    } else if (transcript) { // Listening stopped, and there's a transcript
      console.log("Transcript:", transcript);
      setIsProcessingCommand(true);
      const lowerTranscript = transcript.toLowerCase();

      if (!isNinaActive) {
        if (lowerTranscript.includes("nina")) {
          setIsNinaActive(true);
          setNinaResponse("Nina activée. Que puis-je faire pour vous, monsieur ?");
          showSuccess("Nina activée !");
          startListening(); // Restart listening for actual commands
        } else {
          setNinaResponse("Veuillez dire 'Nina' pour m'activer, monsieur.");
          startListening(); // Keep listening for activation
        }
      } else {
        // Nina is active, process the command
        processCommand(transcript);
      }
      setTextCommand('');
    }
  }, [transcript, isListening, isNinaActive, startListening, processCommand]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setNinaResponse(isNinaActive ? "J'ai arrêté d'écouter, monsieur." : "Dites 'Nina' ou cliquez sur le micro pour m'activer.");
    } else {
      startListening();
      setIsNinaActive(true); // Explicitly activate Nina when mic button is clicked
      setNinaResponse("J'écoute, monsieur...");
    }
  };

  const handleTextCommandSubmit = () => {
    if (textCommand.trim()) {
      setIsProcessingCommand(true);
      const lowerTextCommand = textCommand.toLowerCase();

      if (!isNinaActive) {
        if (lowerTextCommand.includes("nina")) {
          setIsNinaActive(true);
          setNinaResponse("Nina activée. Que puis-je faire pour vous, monsieur ?");
          showSuccess("Nina activée !");
          // No need to start voice listening here, as it's a text command.
          // If user wants voice, they'll click the mic.
        } else {
          setNinaResponse("Veuillez dire 'Nina' ou taper 'Nina' pour m'activer, monsieur.");
          setIsProcessingCommand(false); // Stop processing if not activated
        }
      } else {
        processCommand(textCommand);
      }
      setTextCommand('');
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
          <p className="text-xl font-medium text-gray-800 dark:text-gray-200">
            {isProcessingCommand ? "Traitement de votre commande..." : ninaResponse}
          </p>

          <div className="flex w-full items-center space-x-2 mt-4">
            <Input
              type="text"
              placeholder="Tapez votre commande ici ou parlez..."
              value={textCommand}
              onChange={(e) => setTextCommand(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTextCommandSubmit();
                }
              }}
            />
            <Button type="submit" onClick={handleTextCommandSubmit}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="destructive" onClick={onShutdown} className="w-full mt-4">
            <PowerOff className="mr-2 h-4 w-4" /> Éteindre Nina
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VirtualAssistant;