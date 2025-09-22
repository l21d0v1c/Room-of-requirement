import React, { useState, useEffect, useRef } from 'react';
import { showError } from '@/utils/toast'; // Import showError for user feedback

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  startListening: (continuous?: boolean) => void; // Ajout de l'option 'continuous'
  stopListening: () => void;
  browserSupportsSpeechRecognition: boolean;
}

const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const browserSupportsSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.warn("Votre navigateur ne supporte pas l'API Web Speech Recognition.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    // recognitionRef.current.continuous sera défini par startListening
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'fr-FR'; // Set language to French

    recognitionRef.current.onstart = () => {
      console.log("Speech recognition started.");
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const currentTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      console.log("SpeechRecognition onresult:", currentTranscript);
      setTranscript(currentTranscript);
    };

    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended.");
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      showError(`Erreur de reconnaissance vocale: ${event.error}. Vérifiez les permissions du microphone.`);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [browserSupportsSpeechRecognition]);

  const startListening = (continuousMode: boolean = false) => { // Par défaut, non continu
    if (recognitionRef.current && !isListening) {
      setTranscript(''); // Clear previous transcript
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

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
  };
};

export default useSpeechRecognition;