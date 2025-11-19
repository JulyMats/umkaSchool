import { Search } from 'lucide-react';
import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exerciseTypeService, ExerciseType } from '../services/exerciseType.service';
import pandaImage from '../assets/panda.png';

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
      <div className="flex items-center gap-6 mb-2">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        <div className="flex-shrink-0">
          <img 
            src={pandaImage} 
            alt="Panda" 
            className="w-32 h-32 object-cover"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
          >
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{exercise.name}</h3>
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium flex-shrink-0
                  ${exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-700' : ''}
                  ${exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' : ''}
                  ${exercise.difficulty === 'advanced' ? 'bg-red-100 text-red-700' : ''}
                `}>
                  {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{exercise.description}</p>
            </div>
            <div className="flex justify-end mt-4">
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