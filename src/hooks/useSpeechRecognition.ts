import React, { useState, useEffect, useRef } from 'react';
import { showError } from '@/utils/toast'; // Import showError for user feedback

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  startListening: (continuous?: boolean) => void;
  stopListening: () => void;
  browserSupportsSpeechRecognition: boolean;
  resetTranscript: () => void;
  isFinal: boolean;
  isSpeechEndedByPause: boolean;
}

const PAUSE_DETECTION_DELAY = 2000; // 2 secondes

const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isFinal, setIsFinal] = useState<boolean>(false);
  const [isSpeechEndedByPause, setIsSpeechEndedByPause] = useState<boolean>(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs pour stocker les valeurs d'état les plus récentes pour les callbacks d'événements
  const isListeningRef = useRef(isListening);
  const isSpeechEndedByPauseRef = useRef(isSpeechEndedByPause);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isSpeechEndedByPauseRef.current = isSpeechEndedByPause;
  }, [isSpeechEndedByPause]);

  const browserSupportsSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.warn("Votre navigateur ne supporte pas l'API Web Speech Recognition.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'fr-FR';

    const resetPauseTimer = (continuousMode: boolean) => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      speechTimeoutRef.current = setTimeout(() => {
        // Utiliser isListeningRef.current pour la valeur la plus récente
        if (isListeningRef.current && continuousMode) {
          console.log("Speech ended by pause.");
          setIsSpeechEndedByPause(true);
        }
      }, PAUSE_DETECTION_DELAY);
    };

    recognitionRef.current.onstart = () => {
      console.log("Speech recognition started.");
      setIsListening(true);
      setIsFinal(false);
      setIsSpeechEndedByPause(false);
      if (recognitionRef.current?.continuous) {
        resetPauseTimer(true);
      }
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
      
      currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      setIsFinal(event.results[event.results.length - 1].isFinal);

      if (recognitionRef.current?.continuous) {
        resetPauseTimer(true);
      }
    };

    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended.");
      setIsListening(false);
      setIsFinal(false);
      // Clear timeout on end to prevent late state updates
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }
      setIsSpeechEndedByPause(false); // Reset pause state on end
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsFinal(false);
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }
      setIsSpeechEndedByPause(false); // Reset pause state on error
      showError(`Erreur de reconnaissance vocale: ${event.error}. Vérifiez les permissions du microphone.`);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }
    };
  }, [browserSupportsSpeechRecognition]); // Dépendances minimales pour useEffect

  const startListening = (continuousMode: boolean = false) => {
    if (recognitionRef.current && !isListeningRef.current) { // Utiliser la ref pour la vérification
      setTranscript('');
      setIsFinal(false);
      setIsSpeechEndedByPause(false);
      recognitionRef.current.continuous = continuousMode;
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
    if (recognitionRef.current && isListeningRef.current) { // Utiliser la ref pour la vérification
      recognitionRef.current.stop();
      console.log("Attempting to stop speech recognition...");
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }
      setIsSpeechEndedByPause(false);
    }
  };

  const resetTranscript = () => {
    setTranscript('');
    setIsFinal(false);
    setIsSpeechEndedByPause(false);
  };

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
    resetTranscript,
    isFinal,
    isSpeechEndedByPause,
  };
};

export default useSpeechRecognition;