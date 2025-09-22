import React, { useState, useEffect, useRef, useCallback } from 'react';
import { showError } from '@/utils/toast'; // Import showError for user feedback

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  startListening: (continuous?: boolean) => void; // Ajout de l'option 'continuous'
  stopListening: () => void;
  browserSupportsSpeechRecognition: boolean;
  resetTranscript: () => void; // Ajout de la fonction pour réinitialiser la transcription
  isFinal: boolean; // Ajout de l'état pour indiquer si la transcription est finale
  isSpeechEndedByPause: boolean; // Nouvel état pour la détection de pause
}

const PAUSE_DETECTION_DELAY = 2000; // 2 secondes

const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isFinal, setIsFinal] = useState<boolean>(false); // Nouvel état pour isFinal
  const [isSpeechEndedByPause, setIsSpeechEndedByPause] = useState<boolean>(false); // Nouvel état pour la détection de pause
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Timer pour la détection de pause
  const browserSupportsSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  const resetPauseTimer = useCallback(() => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    speechTimeoutRef.current = setTimeout(() => {
      // Déclenche la détection de pause uniquement si l'écoute est continue et active
      if (isListening && recognitionRef.current?.continuous) {
        console.log("Speech ended by pause.");
        setIsSpeechEndedByPause(true);
      }
    }, PAUSE_DETECTION_DELAY);
  }, [isListening]); // Dépend de isListening pour s'assurer que le timer est pertinent

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
      setIsSpeechEndedByPause(false); // Reset pause state on start
      if (recognitionRef.current?.continuous) {
        resetPauseTimer(); // Démarre le timer de pause si l'écoute est continue
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
      
      // If there's a final transcript, use it. Otherwise, use interim.
      // This ensures 'transcript' always holds the most complete current speech.
      currentTranscript = finalTranscript || interimTranscript;

      setTranscript(currentTranscript);
      setIsFinal(event.results[event.results.length - 1].isFinal); // Set isFinal based on the last result

      // Réinitialise le timer de pause à chaque nouveau résultat si l'écoute est continue
      if (recognitionRef.current?.continuous) {
        resetPauseTimer();
      }
    };

    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended.");
      setIsListening(false);
      setIsFinal(false); // Reset isFinal on end
      // Si le timer de pause est actif, le clear ici pour éviter un déclenchement tardif
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }
      // Si l'écoute s'est arrêtée et qu'il y avait une transcription, cela peut aussi signifier une fin de commande
      // Mais nous nous fions principalement au timer pour le mode continu.
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsFinal(false); // Reset isFinal on error
      setIsSpeechEndedByPause(false); // Reset pause state on error
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }
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
  }, [browserSupportsSpeechRecognition, resetPauseTimer]); // Ajout de resetPauseTimer aux dépendances

  const startListening = (continuousMode: boolean = false) => {
    if (recognitionRef.current && !isListening) {
      setTranscript(''); // Clear previous transcript on start
      setIsFinal(false); // Reset isFinal on start
      setIsSpeechEndedByPause(false); // Reset pause state on start
      recognitionRef.current.continuous = continuousMode; // Définir le mode continu ici
      try {
        recognitionRef.current.start();
        console.log("Attempting to start speech recognition...");
        if (continuousMode) {
          resetPauseTimer(); // Démarre le timer de pause pour le mode continu
        }
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
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }
      setIsSpeechEndedByPause(false); // Reset pause state on stop
    }
  };

  const resetTranscript = () => {
    setTranscript('');
    setIsFinal(false); // Reset isFinal when transcript is reset
    setIsSpeechEndedByPause(false); // Reset pause state when transcript is reset
  };

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
    resetTranscript,
    isFinal, // Retourne isFinal
    isSpeechEndedByPause, // Retourne le nouvel état
  };
};

export default useSpeechRecognition;