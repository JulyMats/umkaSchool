import { Homework } from '../types/homework';
import { Exercise } from '../types/exercise';
import { ExerciseSessionConfig } from '../types/exercise';

export type HomeworkFilter = 'all' | 'pending' | 'completed' | 'overdue';

export const filterHomework = (
  homework: Homework[],
  filter: HomeworkFilter
): Homework[] => {
  if (filter === 'all') return homework;
  return homework.filter(item => item.status === filter);
};

export const convertExerciseToConfig = (exercise: Exercise): ExerciseSessionConfig => {
  const params = JSON.parse(exercise.parameters || '{}');
  
  const config: ExerciseSessionConfig = {
    exerciseTypeId: exercise.exerciseTypeId,
    exerciseTypeName: exercise.exerciseTypeName,
  };

  if (params.timePerQuestion) config.timePerQuestion = params.timePerQuestion;
  if (params.displaySpeed) config.displaySpeed = params.displaySpeed;
  if (params.cardCount) config.cardCount = params.cardCount;
  if (params.exampleCount) config.exampleCount = params.exampleCount;
  if (params.dividendDigits) config.dividendDigits = params.dividendDigits;
  if (params.divisorDigits) config.divisorDigits = params.divisorDigits;
  if (params.firstMultiplierDigits) config.firstMultiplierDigits = params.firstMultiplierDigits;
  if (params.minValue !== undefined) config.minValue = params.minValue;
  if (params.maxValue !== undefined) config.maxValue = params.maxValue;
  if (params.digitLength) config.digitLength = params.digitLength;
  if (params.digitType) config.digitType = params.digitType;
  if (params.theme) config.theme = params.theme;
  if (params.min !== undefined) config.min = params.min;
  if (params.max !== undefined) config.max = params.max;

  return config;
};


export const formatAssignmentStatus = (status: string): string => {
  switch (status) {
    case 'ASSIGNED':
      return 'Assigned';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
      return 'Completed';
    case 'OVERDUE':
      return 'Overdue';
    default:
      return status;
  }
};


export const getAssignmentStatusColors = (status: string) => {
  switch (status) {
    case 'ASSIGNED':
    case 'IN_PROGRESS':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-700'
      };
    case 'COMPLETED':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        badge: 'bg-green-100 text-green-700'
      };
    case 'OVERDUE':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-700'
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        badge: 'bg-gray-100 text-gray-700'
      };
  }
};
