import React from 'react';
import { HomeworkDetail } from '../../../types/homework';
import { Exercise } from '../../../types/exercise';
import { ExerciseCard } from '../exercise';
import { Button } from '../../ui';
import Modal from '../../ui/Modal';

interface HomeworkDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  homework: HomeworkDetail | null;
  exercises: Exercise[];
  onStart: () => void;
  isLoading?: boolean;
}

const HomeworkDetailsModal: React.FC<HomeworkDetailsModalProps> = ({
  isOpen,
  onClose,
  homework,
  exercises,
  onStart,
  isLoading = false
}) => {
  if (!homework) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={homework.title}
      size="lg"
    >
      <div className="mb-4">
        <p className="text-sm text-gray-500">by {homework.teacherName}</p>
      </div>
      
      {homework.description && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
          <p className="text-gray-600">{homework.description}</p>
        </div>
      )}
      
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Exercises ({homework.exercises.length})
        </h3>
        <div className="space-y-2">
          {homework.exercises.map((exercise, index) => {
            const fullExercise = exercises.find(ex => ex.id === exercise.exerciseId);
            return fullExercise ? (
              <ExerciseCard
                key={exercise.exerciseId}
                exercise={fullExercise}
                showDetails={true}
                variant="default"
              />
            ) : (
              <div key={exercise.exerciseId} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="font-medium text-gray-900">
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

export default HomeworkDetailsModal;

