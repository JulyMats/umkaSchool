import { ExerciseType } from '../types/exerciseType';
import { ColorScheme } from '../components/features/exercise/ExerciseTypeCard';

export const EXERCISE_COLOR_SCHEMES: ColorScheme[] = [
  {
    bg: 'bg-gradient-to-br from-pink-100 to-purple-100',
    border: 'border-pink-300',
    button: 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600',
    title: 'text-pink-700'
  },
  {
    bg: 'bg-gradient-to-br from-blue-100 to-cyan-100',
    border: 'border-blue-300',
    button: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
    title: 'text-blue-700'
  },
  {
    bg: 'bg-gradient-to-br from-yellow-100 to-orange-100',
    border: 'border-yellow-300',
    button: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
    title: 'text-orange-700'
  },
  {
    bg: 'bg-gradient-to-br from-green-100 to-emerald-100',
    border: 'border-green-300',
    button: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
    title: 'text-green-700'
  },
  {
    bg: 'bg-gradient-to-br from-indigo-100 to-purple-100',
    border: 'border-indigo-300',
    button: 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600',
    title: 'text-indigo-700'
  },
  {
    bg: 'bg-gradient-to-br from-rose-100 to-pink-100',
    border: 'border-rose-300',
    button: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600',
    title: 'text-rose-700'
  }
];

export const getColorScheme = (index: number): ColorScheme => {
  return EXERCISE_COLOR_SCHEMES[index % EXERCISE_COLOR_SCHEMES.length];
};

export const filterExerciseTypes = (
  exerciseTypes: ExerciseType[],
  searchQuery: string
): ExerciseType[] => {
  if (!searchQuery.trim()) {
    return exerciseTypes;
  }

  const query = searchQuery.toLowerCase();
  return exerciseTypes.filter(
    exercise =>
      exercise.name.toLowerCase().includes(query) ||
      exercise.description.toLowerCase().includes(query)
  );
};

