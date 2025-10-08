import { Search } from 'lucide-react';
import Layout from '../components/Layout';

interface ExerciseCard {
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: string;
  icon?: string;
}

export default function Exercises() {
  const exercises: ExerciseCard[] = [
    {
      title: "Addition",
      description: "Practice adding numbers from 1 to 20 quickly and accurately. Great for beginners!",
      duration: "5 mins",
      difficulty: "beginner",
      type: "warmup"
    },
    {
      title: "Multiplication",
      description: "Learn tables from 1 to 12 with interactive exercises and timed challenges.",
      duration: "10 mins",
      difficulty: "intermediate",
      type: "multiplication"
    },
    {
      title: "Division",
      description: "Learn advanced mental division techniques to solve problems quickly without a calculator.",
      duration: "15 mins",
      difficulty: "advanced",
      type: "division"
    },
    {
      title: "Subtraction",
      description: "Master the art of subtracting two-digit numbers mentally with these targeted exercises.",
      duration: "8 mins",
      difficulty: "intermediate",
      type: "subtraction"
    },
    {
      title: "Mixed Operations",
      description: "Challenge yourself with problems that combine multiple operations in one context.",
      duration: "10 mins",
      difficulty: "intermediate",
      type: "mixed"
    }
  ];

  return (
    <Layout
      title="Exercises"
      subtitle="Practice your mental arithmetic skills"
    >
      <div className="relative w-64 ml-auto mb-8">
        <input
          type="text"
          placeholder="Search exercises..."
          className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <div
            key={exercise.title}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold mb-2">{exercise.title}</h3>
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
              <button className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                Start
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}