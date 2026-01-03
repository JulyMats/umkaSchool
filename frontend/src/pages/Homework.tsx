import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book } from 'lucide-react';
import Layout from "../components/layout";
import { homeworkService } from '../services/homework.service';
import { exerciseService } from '../services/exercise.service';
import { HomeworkDetail, Homework } from '../types/homework';
import { Exercise } from '../types/exercise';
import { useHomework } from '../hooks/useHomework';
import { useAuth } from '../contexts/AuthContext';
import { filterHomework, convertExerciseToConfig, HomeworkFilter } from '../utils/homework.utils';
import { LoadingState, ErrorState, FilterTabs, EmptyState } from '../components/common';
import { HomeworkCardWithActions, HomeworkDetailsModal, ExerciseSelectionModal } from '../components/features/homework';
import { useModal } from '../hooks';

export default function Homework() {
  const navigate = useNavigate();
  const { homework, loading, error } = useHomework();
  const { student } = useAuth();
  const [filter, setFilter] = useState<HomeworkFilter>('all');
  const [selectedHomework, setSelectedHomework] = useState<HomeworkDetail | null>(null);
  const [selectedHomeworkExercises, setSelectedHomeworkExercises] = useState<Exercise[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  const { isOpen: showDetailsModal, open: openDetailsModal, close: closeDetailsModal } = useModal();
  const { isOpen: showExerciseSelectionModal, open: openExerciseSelectionModal, close: closeExerciseSelectionModal } = useModal();
  const [loadingExercise, setLoadingExercise] = useState(false);

  const filteredHomework = useMemo(
    () => filterHomework(homework, filter),
    [homework, filter]
  );

  if (loading) {
    return (
      <Layout title="Homework" subtitle="Loading homework...">
        <LoadingState message="Loading homework..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Homework" subtitle="Error loading homework">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </Layout>
    );
  }

  const filterOptions = [
    { value: 'all' as const, label: 'All' },
    { value: 'pending' as const, label: 'Pending' },
    { value: 'completed' as const, label: 'Completed', color: 'green' as const },
    { value: 'overdue' as const, label: 'Overdue', color: 'red' as const }
  ];


  const loadHomeworkDetails = async (homeworkId: string) => {
    try {
      const homeworkDetail = await homeworkService.getHomeworkById(homeworkId);
      setSelectedHomework(homeworkDetail);
      
      const exercisePromises = homeworkDetail.exercises.map(ex => 
        exerciseService.getExerciseById(ex.exerciseId)
      );
      const exercises = await Promise.all(exercisePromises);
      setSelectedHomeworkExercises(exercises);
      
      return { homeworkDetail, exercises };
    } catch (err: unknown) {
      console.error('Failed to load homework details:', err);
      throw err;
    }
  };

  const handleSeeDetails = async (homeworkId: string) => {
    try {
      await loadHomeworkDetails(homeworkId);
      openDetailsModal();
    } catch (err: unknown) {
     
    }
  };

  const handleStartHomework = async (homeworkItem: Homework) => {
    try {
      setLoadingExercise(true);
      const { homeworkDetail, exercises } = await loadHomeworkDetails(homeworkItem.id);
      setSelectedAssignmentId(homeworkItem.assignmentId);

      if (!homeworkDetail.exercises || homeworkDetail.exercises.length === 0) {
        throw new Error('This homework has no exercises assigned.');
      }

      let completedIds: string[] = [];
      if (homeworkItem.assignmentId && student?.id) {
        try {
          completedIds = await homeworkService.getCompletedExerciseIds(
            homeworkItem.assignmentId,
            student.id
          );
          setCompletedExerciseIds(completedIds);
        } catch (err) {
          console.error('Failed to load completed exercises:', err);
          setCompletedExerciseIds([]);
        }
      } else {
        setCompletedExerciseIds([]);
      }

      if (homeworkDetail.exercises.length === 1) {
        const exerciseId = homeworkDetail.exercises[0].exerciseId;
        const isCompleted = completedIds.includes(exerciseId);
        if (!isCompleted) {
          const exercise = exercises.find(ex => ex.id === exerciseId);
          if (exercise) {
            const config = convertExerciseToConfig(exercise);
            navigate('/exercises/play', { state: { config, returnPath: '/homework' } });
          }
        }
      } else {
        openExerciseSelectionModal();
      }
    } catch (err: unknown) {
      console.error('Failed to start homework:', err);
    } finally {
      setLoadingExercise(false);
    }
  };

  const handleSelectExercise = async (exerciseId: string) => {
    try {
      if (completedExerciseIds.includes(exerciseId)) {
        return;
      }
      setLoadingExercise(true);
      const exercise = await exerciseService.getExerciseById(exerciseId);
      const config = convertExerciseToConfig(exercise);
      closeExerciseSelectionModal();
      navigate('/exercises/play', { state: { config, returnPath: '/homework' } });
    } catch (err: unknown) {
      console.error('Failed to load exercise:', err);
    } finally {
      setLoadingExercise(false);
    }
  };

  const handleStartFromDetails = () => {
    closeDetailsModal();
    if (selectedHomework && selectedAssignmentId) {
      const homeworkItem = homework.find(h => h.id === selectedHomework.id);
      if (homeworkItem) {
        handleStartHomework(homeworkItem);
      }
    }
  };

  return (
    <Layout
      title="Homework"
      subtitle="Track and complete your assigned homework"
    >
      <FilterTabs
        filters={filterOptions}
        activeFilter={filter}
        onFilterChange={setFilter}
        className="mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHomework.map((item) => (
          <HomeworkCardWithActions
            key={item.assignmentId || item.id}
            homework={item}
            onSeeDetails={() => handleSeeDetails(item.id)}
            onStart={() => handleStartHomework(item)}
            isLoading={loadingExercise}
          />
        ))}

        {filteredHomework.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl py-12">
            <EmptyState
              icon={Book}
              message={
                filter === 'completed'
                  ? "You haven't completed any homework yet"
                  : filter === 'pending'
                  ? "You don't have any pending homework"
                  : filter === 'overdue'
                  ? "You don't have any overdue homework"
                  : "You don't have any homework assigned"
              }
            />
          </div>
        )}
      </div>

      <HomeworkDetailsModal
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
        homework={selectedHomework}
        exercises={selectedHomeworkExercises}
      />

      <ExerciseSelectionModal
        isOpen={showExerciseSelectionModal}
        onClose={closeExerciseSelectionModal}
        homework={selectedHomework}
        exercises={selectedHomeworkExercises}
        onSelectExercise={handleSelectExercise}
        completedExerciseIds={completedExerciseIds}
      />
    </Layout>
  );
}