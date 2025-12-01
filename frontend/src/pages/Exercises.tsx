import { Search } from 'lucide-react';
import Layout from '../components/layout';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exerciseTypeService } from '../services/exerciseType.service';
import { ExerciseType } from '../types/exerciseType';
import pandaImage from '../assets/panda.png';
import { LoadingState, ErrorState } from '../components/common';

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
        <LoadingState message="Loading exercises..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Exercises" subtitle="Error loading exercises">
        <ErrorState message={error} />
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
        {filteredExercises.map((exercise, index) => {
          const colorSchemes = [
            { bg: 'bg-gradient-to-br from-pink-100 to-purple-100', border: 'border-pink-300', button: 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600', title: 'text-pink-700' },
            { bg: 'bg-gradient-to-br from-blue-100 to-cyan-100', border: 'border-blue-300', button: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600', title: 'text-blue-700' },
            { bg: 'bg-gradient-to-br from-yellow-100 to-orange-100', border: 'border-yellow-300', button: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600', title: 'text-orange-700' },
            { bg: 'bg-gradient-to-br from-green-100 to-emerald-100', border: 'border-green-300', button: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600', title: 'text-green-700' },
            { bg: 'bg-gradient-to-br from-indigo-100 to-purple-100', border: 'border-indigo-300', button: 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600', title: 'text-indigo-700' },
            { bg: 'bg-gradient-to-br from-rose-100 to-pink-100', border: 'border-rose-300', button: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600', title: 'text-rose-700' },
          ];
          const colors = colorSchemes[index % colorSchemes.length];
          
          return (
            <div
              key={exercise.id}
              className={`${colors.bg} ${colors.border} border-2 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:scale-105`}
            >
              <div className="flex-1">
                <div className="flex flex-col items-center mb-3">
                  <h3 className={`text-xl font-bold ${colors.title} text-center mb-2`}>{exercise.name}</h3>
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-bold shadow-md
                    ${exercise.difficulty === 'beginner' ? 'bg-green-400 text-white' : ''}
                    ${exercise.difficulty === 'intermediate' ? 'bg-yellow-400 text-white' : ''}
                    ${exercise.difficulty === 'advanced' ? 'bg-red-400 text-white' : ''}
                  `}>
                    {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                  </span>
                </div>
                <p className="text-gray-700 text-sm font-medium leading-relaxed text-center">{exercise.description}</p>
              </div>
              <div className="flex justify-center mt-6">
                <button 
                  onClick={() => navigate(`/exercises/${exercise.id}/setup`, { state: { exerciseType: exercise } })}
                  className={`${colors.button} text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110`}
                >
                  🚀 Start
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}