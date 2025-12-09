export interface ExerciseParameters {
  exampleCount?: number;
  cardCount?: number;
  digitType?: string;
  dividendDigits?: [number, number];
  divisorDigits?: [number, number];
  firstMultiplierDigits?: [number, number];
  minValue?: number;
  maxValue?: number;
  timePerQuestion?: number;
  displaySpeed?: number;
  theme?: string;
  digitLength?: number;
  min?: number;
  max?: number;
}

export const formatExerciseParameters = (parameters: string): string => {
  try {
    const params: ExerciseParameters = JSON.parse(parameters);
    const parts: string[] = [];

    if (params.exampleCount) {
      parts.push(`${params.exampleCount} examples`);
    }
    if (params.cardCount) {
      parts.push(`${params.cardCount} cards`);
    }
    if (params.digitType) {
      const digitTypeLabels: Record<string, string> = {
        'single-digit': 'Single-digit',
        'two-digit': 'Two-digit',
        'three-digit': 'Three-digit',
        'four-digit': 'Four-digit'
      };
      parts.push(digitTypeLabels[params.digitType] || params.digitType);
    }
    if (params.dividendDigits) {
      parts.push(`Dividend: ${params.dividendDigits[0]}-${params.dividendDigits[1]} digits`);
    }
    if (params.divisorDigits) {
      parts.push(`Divisor: ${params.divisorDigits[0]}-${params.divisorDigits[1]} digits`);
    }
    if (params.firstMultiplierDigits) {
      parts.push(`Multiplier: ${params.firstMultiplierDigits[0]}-${params.firstMultiplierDigits[1]} digits`);
    }
    if (params.minValue !== undefined && params.maxValue !== undefined) {
      parts.push(`Range: ${params.minValue}-${params.maxValue}`);
    }
    if (params.min !== undefined && params.max !== undefined) {
      parts.push(`Range: ${params.min}-${params.max}`);
    }
    if (params.timePerQuestion) {
      const minutes = Math.floor(params.timePerQuestion / 60);
      const seconds = params.timePerQuestion % 60;
      if (minutes > 0) {
        parts.push(`Time: ${minutes}m ${seconds > 0 ? seconds + 's' : ''}`);
      } else {
        parts.push(`Time: ${seconds}s`);
      }
    }
    if (params.displaySpeed) {
      parts.push(`Speed: ${params.displaySpeed}s`);
    }
    if (params.theme) {
      const themeLabels: Record<string, string> = {
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
      parts.push(`Theme: ${themeLabels[params.theme] || params.theme}`);
    }

    return parts.length > 0 ? parts.join(' • ') : 'No parameters';
  } catch (error) {
    console.error('Error parsing exercise parameters:', error);
    return 'Invalid parameters';
  }
};

export const formatNumberWithSign = (
  number: number,
  index: number,
  isSubtraction: boolean
): string => {
  if (index === 0) {
    return isSubtraction ? `-${number}` : `+${number}`;
  }
  return isSubtraction ? `-${number}` : `+${number}`;
};

export const isSubtractionExercise = (exerciseTypeName: string): boolean => {
  const name = exerciseTypeName.toLowerCase();
  return name.includes('subtraction') || name.includes('subtract');
};

