import Tts from 'react-native-tts';

export const speak = (message: string) => {
  Tts.speak(message);
};