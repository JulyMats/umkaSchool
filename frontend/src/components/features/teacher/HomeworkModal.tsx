import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Exercise } from '../../../types/exercise';
import { ExerciseType } from '../../../types/exerciseType';
import { Modal, Button } from '../../../components/ui';
import { formatExerciseParameters } from '../../../utils/exercise.utils';
import CreateExerciseForm from './CreateExerciseForm';

type HomeworkModalMode = 'create' | 'edit';

export interface HomeworkFormState {
  id?: string;
  title: string;
  description: string;
  selectedExerciseIds: string[];
}

interface HomeworkModalProps {
  isOpen: boolean;
  mode: HomeworkModalMode;
  isSaving: boolean;
  formState: HomeworkFormState;
  exercises: Exercise[];
  exerciseTypes: ExerciseType[];
  teacherId: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: React.Dispatch<React.SetStateAction<HomeworkFormState>>;
  onExerciseCreated: (exercise: Exercise) => void;
}

const HomeworkModal: React.FC<HomeworkModalProps> = ({
  isOpen,
  mode,
  isSaving,
  formState,
  exercises,
  exerciseTypes,
  teacherId,
  onClose,
  onSubmit,
  onChange,
  onExerciseCreated
}) => {
  const [activeTab, setActiveTab] = useState<'existing' | 'create'>('existing');
  const [creatingExercise, setCreatingExercise] = useState(false);
  const [createExerciseError, setCreateExerciseError] = useState<string | null>(null);

  const toggleExercise = (exerciseId: string) => {
    onChange((prev) => {
      const alreadySelected = prev.selectedExerciseIds.includes(exerciseId);
      return {
        ...prev,
        selectedExerciseIds: alreadySelected
          ? prev.selectedExerciseIds.filter((id) => id !== exerciseId)
          : [...prev.selectedExerciseIds, exerciseId]
      };
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Homework Set' : 'Edit Homework Set'}
      size="xl"
    >
      <p className="text-sm text-gray-500 mb-6">
        Combine exercises into a reusable homework collection.
      </p>
      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase text-gray-500">Title</label>
            <input
              type="text"
              required
              value={formState.title}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, title: event.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase text-gray-500">Description</label>
            <textarea
              rows={5}
              value={formState.description}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, description: event.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Explain the focus of this homework set..."
            />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Exercises
            </h3>
            <span className="text-xs text-gray-500">
              {formState.selectedExerciseIds.length} selected
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('existing')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'existing'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Select Existing
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'create'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Create New
            </button>
          </div>

          {/* Existing Exercises Tab */}
          {activeTab === 'existing' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className="w-full px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New Exercise
              </button>
              <div className="max-h-80 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100">
                {exercises.map((exercise) => {
                  const checked = formState.selectedExerciseIds.includes(exercise.id);
                  return (
                    <label
                      key={exercise.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {exercise.exerciseTypeName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatExerciseParameters(exercise.parameters)}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleExercise(exercise.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  );
                })}

                {exercises.length === 0 && (
                  <div className="px-4 py-6 text-center text-gray-400 text-sm">
                    No exercises available yet. Create exercises first to build homework sets.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create New Exercise Tab */}
          {activeTab === 'create' && (
            <CreateExerciseForm
              exerciseTypes={exerciseTypes}
              teacherId={teacherId}
              creating={creatingExercise}
              error={createExerciseError}
              onCreatingChange={setCreatingExercise}
              onErrorChange={setCreateExerciseError}
              onExerciseCreated={(exercise) => {
                onExerciseCreated(exercise);
                onChange((prev) => ({
                  ...prev,
                  selectedExerciseIds: [...prev.selectedExerciseIds, exercise.id]
                }));
                setActiveTab('existing');
              }}
            />
          )}
        </section>

        <div className="lg:col-span-2 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            variant="primary"
          >
            {isSaving
              ? 'Saving...'
              : mode === 'create'
              ? 'Create Homework'
              : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default HomeworkModal;

