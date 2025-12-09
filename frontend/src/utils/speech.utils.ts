interface SpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const speakNumber = (
  number: number,
  options: SpeechOptions = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(number.toString());
    
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate ?? 1.0; 
    utterance.pitch = options.pitch ?? 1.0; 
    utterance.volume = options.volume ?? 1.0; 

    utterance.onend = () => resolve();
    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      reject(error);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
};


export const stopSpeech = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};


export const isSpeechSupported = (): boolean => {
  return 'speechSynthesis' in window;
};


export const LANGUAGE_VOICE_MAP: Record<string, string> = {
  'EN': 'en-US',
  'PL': 'pl-PL',
  'RU': 'ru-RU'
};


export const getTTSLanguage = (appLanguage: string | undefined): string => {
  if (!appLanguage) return 'en-US';
  return LANGUAGE_VOICE_MAP[appLanguage] || 'en-US';
};


export const calculateSpeechRate = (displaySpeed: number): number => {
  if (displaySpeed <= 0.5) {
    console.log('Very fast card flips');
    return 10.0; 
  }
  if (displaySpeed <= 1.0) {
    return 10.0; 
  }
  if (displaySpeed <= 2.0) {
    return 2.0; 
  }
  if (displaySpeed <= 5.0) {
    return 1.5;
  }
  return 1.0; 
};

