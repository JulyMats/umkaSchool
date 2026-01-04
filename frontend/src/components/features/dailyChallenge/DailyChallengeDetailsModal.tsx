import React from 'react';
import { DailyChallenge } from '../../../types/dailyChallenge';
import { Exercise } from '../../../types/exercise';
import { ExerciseCard } from '../exercise';
import { Button } from '../../ui';
import Modal from '../../ui/Modal';

interface DailyChallengeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyChallenge: DailyChallenge | null;
  exercises: Exercise[];
  onStart: () => void;
  isLoading?: boolean;
}

const DailyChallengeDetailsModal: React.FC<DailyChallengeDetailsModalProps> = ({
  isOpen,
  onClose,
  dailyChallenge,
  exercises,
  onStart,
  isLoading = false
}) => {
  if (!dailyChallenge) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={dailyChallenge.title}
      size="lg"
    >
      {dailyChallenge.description && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
          <p className="text-gray-600 dark:text-gray-400">{dailyChallenge.description}</p>
        </div>
      )}
      
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Exercises ({dailyChallenge.exercises.length})
        </h3>
        <div className="space-y-2">
          {dailyChallenge.exercises.map((exercise, index) => {
            const fullExercise = exercises.find(ex => ex.id === exercise.exerciseId);
            return fullExercise ? (
              <ExerciseCard
                key={exercise.exerciseId}
                exercise={fullExercise}
                showDetails={true}
                variant="default"
              />
            ) : (
              <div key={exercise.exerciseId} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {index + 1}. {exercise.exerciseTypeName}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button
          onClick={onStart}
          disabled={isLoading}
          variant="primary"
          size="md"
        >
          {isLoading ? 'Loading...' : 'Start Now'}
        </Button>
      </div>
    </Modal>
  );
};

export default DailyChallengeDetailsModal;

