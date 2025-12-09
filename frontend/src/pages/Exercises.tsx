import { useState, useMemo } from 'react';
import Layout from '../components/layout';
import { useExerciseTypes } from '../hooks/useExerciseTypes';
import { filterExerciseTypes, getColorScheme } from '../utils/exerciseType.utils';
import { SearchInput } from '../components/ui';
import { LoadingState, ErrorState, EmptySearchResults } from '../components/common';
import { ExerciseTypeCard } from '../components/features/exercise';
import pandaImage from '../assets/panda.png';

export default function Exercises() {
  const { exerciseTypes, loading, error } = useExerciseTypes();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExercises = useMemo(
    () => filterExerciseTypes(exerciseTypes, searchQuery),
    [exerciseTypes, searchQuery]
  );

  if (loading) {
    return (
      <Layout title="Exercises" subtitle="Loading exercises...">
        <LoadingState message="Loading exercises..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Exercises" subtitle="Error loading exercises">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </Layout>
    );
  }

  return (
    <Layout
      title="Exercises"
      subtitle="Practice your mental arithmetic skills"
    >
      <div className="flex items-center gap-6 mb-6">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-shrink-0">
          <img 
            src={pandaImage} 
            alt="Panda" 
            className="w-32 h-32 object-cover"
          />
        </div>
      </div>

      {filteredExercises.length === 0 ? (
        <EmptySearchResults
          searchQuery={searchQuery}
          onClear={() => setSearchQuery('')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise, index) => (
            <ExerciseTypeCard
              key={exercise.id}
              exerciseType={exercise}
              colorScheme={getColorScheme(index)}
              index={index}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}