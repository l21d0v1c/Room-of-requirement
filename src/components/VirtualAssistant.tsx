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
  const [ninaResponse, setNinaResponse] = useState<string>("Que puis-je faire pour vous monsieur ?");
  const [textCommand, setTextCommand] = useState<string>('');
  const { transcript, isListening, startListening, stopListening, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition();

  // Effect for initial listening and cleanup
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      showError("Votre navigateur ne supporte pas la reconnaissance vocale. Nina ne pourra pas écouter vos commandes.");
    } else {
      // Start listening continuously when the component mounts
      startListening(true);
    }
    return () => {
      stopListening();
    };
  }, [browserSupportsSpeechRecognition, startListening, stopListening]);

  // Effect to update textCommand with transcript
  useEffect(() => {
    if (isListening) {
      setTextCommand(transcript);
    }
  }, [transcript, isListening]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setNinaResponse("J'ai arrêté d'écouter, monsieur.");
    } else {
      startListening(true);
      setNinaResponse("Que puis-je faire pour vous monsieur ?");
    }
  };

  const handleTextCommandSubmit = () => {
    // For now, we just clear the input as there's no command processing
    setTextCommand('');
    resetTranscript();
    setNinaResponse("J'ai effacé la mémoire. Dites votre prochaine commande, monsieur.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg text-center relative">
        <div className="absolute top-2 right-4 text-sm text-gray-500 dark:text-gray-400">
          Page 4
        </div>
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
            {ninaResponse}
          </p>

          <div className="flex w-full items-center space-x-2 mt-4">
            <Input
              type="text"
              placeholder="Nina écoute..."
              value={textCommand}
              onChange={(e) => setTextCommand(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTextCommandSubmit();
                }
              }}
              disabled={isListening} // Disable manual typing when listening
            />
            <Button type="submit" onClick={handleTextCommandSubmit} disabled={isListening}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {isListening && browserSupportsSpeechRecognition && (
            <p className="text-sm text-muted-foreground mt-2">
              Nina écoute vos paroles...
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