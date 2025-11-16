export type DigitLength = 1 | 2 | 3 | 4;

export interface ExerciseSessionConfig {
  exerciseTypeId: string;
  exerciseTypeName: string;
  timePerQuestion: number;
  displaySpeed: number;
  cardCount: number;
  digitLength: DigitLength;
  min?: number; // Optional min value for number generation
  max?: number; // Optional max value for number generation
}
