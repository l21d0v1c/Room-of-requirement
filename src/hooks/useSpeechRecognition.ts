import React, { useState, useEffect, useRef } from 'react';
import { showError } from '@/utils/toast'; // Import showError for user feedback

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  startListening: (continuous?: boolean) => void; // Ajout de l'option 'continuous'
  stopListening: () => void;
  browserSupportsSpeechRecognition: boolean;
  resetTranscript: () => void; // Ajout de la fonction pour réinitialiser la transcription
  isFinal: boolean; // Ajout de l'état pour indiquer si la transcription est finale
}

const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isFinal, setIsFinal] = useState<boolean>(false); // Nouvel état pour isFinal
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const browserSupportsSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.warn("Votre navigateur ne supporte pas l'API Web Speech Recognition.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.interimResults = true; // IMPORTANT : Réactivé pour une détection en temps réel
    recognitionRef.current.lang = 'fr-FR'; // Set language to French

    recognitionRef.current.onstart = () => {
      console.log("Speech recognition started.");
      setIsListening(true);
      setIsFinal(false); // Reset isFinal on start
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let currentTranscript = '';
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      // If there's a final transcript, use it. Otherwise, use interim.
      // This ensures 'transcript' always holds the most complete current speech.
      currentTranscript = finalTranscript || interimTranscript;

      setTranscript(currentTranscript);
      setIsFinal(event.results[event.results.length - 1].isFinal); // Set isFinal based on the last result
    };

    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended.");
      setIsListening(false);
      setIsFinal(false); // Reset isFinal on end
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsFinal(false); // Reset isFinal on error
      showError(`Erreur de reconnaissance vocale: ${event.error}. Vérifiez les permissions du microphone.`);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [browserSupportsSpeechRecognition]);

  const startListening = (continuousMode: boolean = false) => {
    if (recognitionRef.current && !isListening) {
      setTranscript(''); // Clear previous transcript on start
      setIsFinal(false); // Reset isFinal on start
      recognitionRef.current.continuous = continuousMode; // Définir le mode continu ici
      try {
        recognitionRef.current.start();
        console.log("Attempting to start speech recognition...");
      } catch (error) {
        console.error("Error calling recognition.start():", error);
        showError("Impossible de démarrer la reconnaissance vocale. Vérifiez les permissions du microphone.");
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      console.log("Attempting to stop speech recognition...");
    }
  };

  const resetTranscript = () => {
    setTranscript('');
    setIsFinal(false); // Reset isFinal when transcript is reset
  };

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
    resetTranscript,
    isFinal, // Retourne isFinal
  };
};

export default useSpeechRecognition;