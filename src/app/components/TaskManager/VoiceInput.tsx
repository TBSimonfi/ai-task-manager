'use client'

import { useState, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'

interface VoiceInputProps {
  onResult: (text: string) => void;
  isAdding: boolean;
}

export default function VoiceInput({ onResult, isAdding }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US'; // Default, can be improved to detect current language

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      setRecognition(rec);
    }
  }, [onResult]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  if (!recognition) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={isAdding}
      className={`p-2.5 rounded-lg transition-all border flex items-center justify-center ${
        isListening 
          ? 'bg-red-500 border-red-600 text-white animate-pulse shadow-lg shadow-red-900/20' 
          : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400'
      }`}
      title={isListening ? 'Stop Listening' : 'Add by Voice'}
    >
      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
}
