import { Search } from 'lucide-react';
import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exerciseTypeService, ExerciseType } from '../services/exerciseType.service';

type ExerciseCard = ExerciseType;

export default function Exercises() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<ExerciseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const exerciseTypes = await exerciseTypeService.getAllExerciseTypes();
        setExercises(exerciseTypes);
        setError(null);
      } catch (err) {
        setError('Failed to load exercises. Please try again later.');
        console.error('Error fetching exercises:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  if (loading) {
    return (
      <Layout title="Exercises" subtitle="Loading exercises...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Exercises" subtitle="Error loading exercises">
        <div className="text-red-500 text-center p-4">{error}</div>
      </Layout>
    );
  }

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout
      title="Exercises"
      subtitle="Practice your mental arithmetic skills"
    >
      <div className="relative w-64 ml-auto mb-8">
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold mb-2">{exercise.name}</h3>
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-700' : ''}
                  ${exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' : ''}
                  ${exercise.difficulty === 'advanced' ? 'bg-red-100 text-red-700' : ''}
                `}>
                  {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{exercise.description}</p>
              {exercise.parameterRanges?.digitTypes && exercise.parameterRanges.digitTypes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {exercise.parameterRanges.digitTypes.map((digitType, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium"
                    >
                      {digitType}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {exercise.duration}
                </span>
              </div>
              <button 
                onClick={() => navigate(`/exercises/${exercise.id}/setup`, { state: { exerciseType: exercise } })}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Start
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}