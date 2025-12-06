import { DigitLength, DigitType } from '../types/exercise';

export const digitOptions: { value: DigitLength; label: string; description: string; emoji: string }[] = [
  { value: 1, label: '1 digit', description: 'Numbers from 1 to 9', emoji: '🔢' },
  { value: 2, label: '2 digits', description: 'Numbers like 14 or 87', emoji: '🔢🔢' },
  { value: 3, label: '3 digits', description: 'Numbers up to 999', emoji: '🔢🔢🔢' },
  { value: 4, label: '4 digits', description: 'Bigger numbers for super brains', emoji: '🔢🔢🔢🔢' }
];

export const digitTypeOptions: { value: DigitType; label: string; description: string; emoji: string }[] = [
  { value: 'single-digit', label: 'Single-digit', description: 'Numbers from 1 to 9', emoji: '1️⃣' },
  { value: 'two-digit', label: 'Two-digit', description: 'Numbers like 14 or 87', emoji: '2️⃣' },
  { value: 'three-digit', label: 'Three-digit', description: 'Numbers up to 999', emoji: '3️⃣' },
  { value: 'four-digit', label: 'Four-digit', description: 'Bigger numbers for super brains', emoji: '4️⃣' }
];

export const themeLabels: Record<string, string> = {
  'simple': 'Simple',
  'friend': 'Friend',
  'brother': 'Brother',
  'transition': 'Transition',
  'friend+brother': 'Friend + Brother',
  'friend+brat': 'Friend + Brat',
  '0-20': 'From 0 to 20',
  '0-9': 'From 0 to 9',
  '10-90': 'Tens (10-90)',
  '10-19': 'Two-digit (10-19)',
  '10-99': 'Two-digit (10-99)',
  '100-900': 'Hundreds (100-900)',
  '100-999': 'Three-digit (100-999)',
  'From 0 to 20': 'From 0 to 20',
  'From 0 to 9': 'From 0 to 9',
  'Tens (10-90)': 'Tens (10-90)',
  'Two-digit (10-19)': 'Two-digit (10-19)',
  'Two-digit (10-99)': 'Two-digit (10-99)',
  'Hundreds (100-900)': 'Hundreds (100-900)',
  'Three-digit (100-999)': 'Three-digit (100-999)'
};

export const digitTypeToLengthMap: Record<DigitType, DigitLength> = {
  'single-digit': 1,
  'two-digit': 2,
  'three-digit': 3,
  'four-digit': 4
};

export const formatTime = (seconds: number): string => {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  return `${seconds}s`;
};

export const digitLabel = (length: number): string => {
  switch (length) {
    case 1:
      return 'one-digit';
    case 2:
      return 'two-digit';
    case 3:
      return 'three-digit';
    case 4:
      return 'four-digit';
    default:
      return 'multi-digit';
  }
};

