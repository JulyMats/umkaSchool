export type DigitLength = 1 | 2 | 3 | 4;
export type DigitType = 'single-digit' | 'two-digit' | 'three-digit' | 'four-digit';

export type SorobanTheme = 'simple' | 'friend' | 'brother' | 'transition' | 'friend+brother' | 'friend+brat';
export type FlashCardTheme = '0-20' | '0-9' | '10-90' | '10-19' | '10-99' | '100-900' | '100-999';

export interface ExerciseSessionConfig {
  exerciseTypeId: string;
  exerciseTypeName: string;
  
  timePerQuestion?: number; // in seconds
  displaySpeed?: number; // in seconds per card
  cardCount?: number; 
  
  exampleCount?: number;
  dividendDigits?: [number, number]; 
  divisorDigits?: [number, number]; 
  
  firstMultiplierDigits?: [number, number]; 
  minValue?: number;
  maxValue?: number;
  
  digitLength?: DigitLength;
  digitType?: DigitType;
  theme?: SorobanTheme | FlashCardTheme; 
  
  min?: number;
  max?: number;
}

export interface Exercise {
    id: string;
    exerciseTypeId: string;
    exerciseTypeName: string;
    parameters: string;
    difficulty: number;
    points: number;
    createdById: string;
    createdByName: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateExercisePayload {
    exerciseTypeId: string;
    parameters: string;
    difficulty?: number; // Optional 
    points?: number; // Optional 
    createdById?: string;
}

export interface UpdateExercisePayload {
    exerciseTypeId?: string;
    parameters?: string;
    difficulty?: number;
    points?: number;
}