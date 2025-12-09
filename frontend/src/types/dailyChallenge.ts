export interface DailyChallenge {
  id: string;
  challengeDate: string;
  title: string;
  description?: string;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  exercises: DailyChallengeExercise[];
}

export interface DailyChallengeExercise {
  exerciseId: string;
  exerciseTypeId: string;
  exerciseTypeName: string;
  parameters: string;
  difficulty: number;
  points: number;
  orderIndex: number;
}

export interface CreateDailyChallengeRequest {
  challengeDate: string;
  title: string;
  description?: string;
  createdById?: string;
  exercises: ExerciseRequest[];
}

export interface ExerciseRequest {
  exerciseId: string;
  orderIndex?: number;
}

