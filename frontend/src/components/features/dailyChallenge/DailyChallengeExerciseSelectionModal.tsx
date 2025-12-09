import React from 'react';
import { DailyChallenge } from '../../../types/dailyChallenge';
import { Exercise } from '../../../types/exercise';
import { ExerciseCard } from '../exercise';
import Modal from '../../ui/Modal';

interface DailyChallengeExerciseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyChallenge: DailyChallenge | null;
  exercises: Exercise[];
  onSelectExercise: (exerciseId: string) => void;
}

const DailyChallengeExerciseSelectionModal: React.FC<DailyChallengeExerciseSelectionModalProps> = ({
  isOpen,
  onClose,
  dailyChallenge,
  exercises,
  onSelectExercise
}) => {
  if (!dailyChallenge) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Exercise"
      size="lg"
    >
      <p className="text-sm text-gray-500 mb-4">
        Select which exercise to start from {dailyChallenge.title}
      </p>
      <div className="space-y-3">
        {dailyChallenge.exercises.map((exercise) => {
          const fullExercise = exercises.find(ex => ex.id === exercise.exerciseId);
          return fullExercise ? (
            <ExerciseCard
              key={exercise.exerciseId}
              exercise={fullExercise}
              onClick={() => onSelectExercise(exercise.exerciseId)}
              showDetails={true}
              variant="default"
            />
          ) : null;
        })}
      </div>
    </Modal>
  );
};

export default DailyChallengeExerciseSelectionModal;

