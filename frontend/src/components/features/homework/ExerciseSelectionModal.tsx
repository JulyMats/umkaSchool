import React from 'react';
import { HomeworkDetail } from '../../../types/homework';
import { Exercise } from '../../../types/exercise';
import { ExerciseCard } from '../exercise';
import Modal from '../../ui/Modal';

interface ExerciseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  homework: HomeworkDetail | null;
  exercises: Exercise[];
  onSelectExercise: (exerciseId: string) => void;
}

const ExerciseSelectionModal: React.FC<ExerciseSelectionModalProps> = ({
  isOpen,
  onClose,
  homework,
  exercises,
  onSelectExercise
}) => {
  if (!homework) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Exercise"
      size="lg"
    >
      <p className="text-sm text-gray-500 mb-4">
        Select which exercise to start from {homework.title}
      </p>
      <div className="space-y-3">
        {homework.exercises.map((exercise) => {
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

export default ExerciseSelectionModal;

