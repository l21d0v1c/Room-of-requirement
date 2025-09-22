import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, PowerOff, Send, Loader2 } from 'lucide-react';
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
  const { transcript, isListening, startListening, stopListening, browserSupportsSpeechRecognition, resetTranscript, isFinal, isSpeechEndedByPause } = useSpeechRecognition();

  // Memoize processCommand
  const processCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase();
    let response = "Je n'ai pas compris cette action, monsieur.";

    if (lowerCommand.includes(safeword.toLowerCase()) || lowerCommand.includes(safecommand.toLowerCase())) {
      response = "Commande d'urgence détectée. Arrêt immédiat de l'application.";
      setNinaResponse(response);
      showError("Arrêt d'urgence activé !");
      setTimeout(onShutdown, 2000);
      setIsProcessingCommand(false);
      return;
    }

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

    setNinaResponse(response);
    setIsProcessingCommand(false);
    // No need to restart listening here, as it's already continuous.
  }, [safeword, safecommand, onShutdown]);

  // Effect for initial listening and cleanup
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      showError("Votre navigateur ne supporte pas la reconnaissance vocale. Nina ne pourra pas écouter vos commandes.");
    } else if (!isListening) {
      // Always start in continuous mode for real-time transcription feedback
      startListening(true);
    }
    return () => {
      stopListening();
    };
  }, [browserSupportsSpeechRecognition, isListening, startListening, stopListening]);

  // Effect for processing transcript changes
  useEffect(() => {
    if (isListening) {
      setTextCommand(transcript); // Always update input with current transcript

      const lowerTranscript = transcript.toLowerCase();

      // Handle "clear" command immediately if Nina is active and listening
      if (isNinaActive && lowerTranscript.includes("clear") && (isFinal || isSpeechEndedByPause)) {
        stopListening(); // Temporarily stop to clear and restart cleanly
        resetTranscript();
        setTextCommand('');
        setNinaResponse("J'ai effacé la mémoire. Dites votre prochaine commande, monsieur.");
        showSuccess("Mémoire effacée.");
        setIsProcessingCommand(false);
        setTimeout(() => startListening(true), 100); // Restart continuous listening
        return;
      }

      // If Nina is not active, check for activation word "Nina"
      if (!isNinaActive && lowerTranscript.includes("nina")) {
        setIsNinaActive(true);
        setNinaResponse("Nina activée. Que puis-je faire pour vous, monsieur ?");
        showSuccess("Nina activée !");
        resetTranscript(); // Clear transcript after activation
        setTextCommand('');
        // No need to stop/restart, as we are already in continuous mode.
        return;
      }

      // If Nina is active, listening continuously, and a final utterance is detected (by API or by pause)
      // Ensure we don't re-process "Nina" as a command
      if (isNinaActive && (isSpeechEndedByPause || isFinal) && transcript.trim() !== "" && !lowerTranscript.includes("nina")) {
        console.log("Command detected (by pause or final):", transcript);
        setIsProcessingCommand(true);
        processCommand(transcript);
        resetTranscript(); // Clear transcript after processing
        setTextCommand('');
        return;
      }

    } else if (!isListening && browserSupportsSpeechRecognition) {
      // If listening stopped unexpectedly (e.g., browser timeout, error) and browser supports it, restart.
      // This ensures continuous listening is maintained.
      console.log("Listening stopped unexpectedly, restarting...");
      setTimeout(() => startListening(true), 500);
    }
  }, [transcript, isListening, isNinaActive, isFinal, isSpeechEndedByPause, startListening, stopListening, resetTranscript, processCommand, browserSupportsSpeechRecognition]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setNinaResponse(isNinaActive ? "J'ai arrêté d'écouter, monsieur." : "Dites 'Nina' ou cliquez sur le micro pour m'activer.");
    } else {
      startListening(true); // Manual click always starts continuous listening
      // Nina is NOT explicitly activated here. It waits for the 'nina' keyword.
      setNinaResponse("Dites 'Nina' pour m'activer, monsieur.");
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
          // If activated by text, we should still ensure voice listening is continuous
          startListening(true);
        } else {
          setNinaResponse("Veuillez dire 'Nina' ou taper 'Nina' pour m'activer, monsieur.");
          setIsProcessingCommand(false);
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
            {isProcessingCommand ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Traitement de votre commande...
              </span>
            ) : ninaResponse}
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

          {isListening && browserSupportsSpeechRecognition && (
            <p className="text-sm text-muted-foreground mt-2">
              {isNinaActive ? "Nina écoute vos commandes..." : "Dites 'Nina' pour activer l'assistante."}
            </p>
          )}
          {!browserSupportsSpeechRecognition && (
            <p className="text-red-500 mt-2">Votre navigateur ne supporte pas la reconnaissance vocale.</p>
          )}
          {browserSupportsSpeechRecognition && !isListening && (
            <p className="text-sm text-yellow-600 mt-2">
              Microphone inactif. Cliquez sur le bouton micro pour démarrer.
            </p>
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