import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "../components/Layout";
import { Clock, CheckCircle, XCircle, Book, Info } from 'lucide-react';
import { homeworkService } from '../services/homework.service';
import { exerciseService } from '../services/exercise.service';
import { Homework as HomeworkItem, HomeworkDetail } from '../types/homework';
import { Exercise } from '../types/exercise';
import { useAuth } from '../contexts/AuthContext';
import { ExerciseSessionConfig } from '../types/exercise';

export default function Homework() {
  const { student, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHomework, setSelectedHomework] = useState<HomeworkDetail | null>(null);
  const [selectedHomeworkExercises, setSelectedHomeworkExercises] = useState<Exercise[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showExerciseSelectionModal, setShowExerciseSelectionModal] = useState(false);
  const [loadingExercise, setLoadingExercise] = useState(false);

  useEffect(() => {
    console.log('[Homework] Component mounted/updated');
    console.log('[Homework] Auth state:', {
      isAuthenticated,
      hasUser: !!user,
      userRole: user?.role,
      hasStudent: !!student,
      studentId: student?.id,
      studentEmail: student?.email
    });

    const fetchHomework = async () => {
      if (!student?.id) {
        console.warn('[Homework] No student ID available');
        setLoading(false);
        // Check if user is authenticated but student data is missing
        if (student === null && user?.role === 'STUDENT') {
          console.warn('[Homework] User is a student but student profile is null');
          setError('Student profile not found. Please complete your profile setup or contact your teacher.');
        } else if (!isAuthenticated) {
          console.warn('[Homework] User is not authenticated');
          setError('Please log in to view your homework.');
        } else {
          console.warn('[Homework] Student information not available');
          setError('Student information not available. Please log in again.');
        }
        return;
      }

      console.log('[Homework] Fetching homework for student ID:', student.id);

      try {
        console.log('[Homework] Calling homeworkService.getCurrentStudentHomework with studentId:', student.id);
        const data = await homeworkService.getCurrentStudentHomework(student.id);
        console.log('[Homework] Homework data received:', data);
        console.log('[Homework] Number of homework items:', data.length);
        setHomework(data);
        setError(null);
      } catch (err: any) {
        console.error('[Homework] Error fetching homework:', err);
        console.error('[Homework] Error details:', {
          message: err?.message,
          response: err?.response?.data,
          status: err?.response?.status,
          config: {
            url: err?.config?.url,
            method: err?.config?.method,
            headers: err?.config?.headers
          }
        });
        const errorMessage = err?.message || 'Failed to load homework. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
        console.log('[Homework] Fetch complete, loading set to false');
      }
    };

    fetchHomework();
  }, [student?.id]);

  if (loading) {
    return (
      <Layout title="Homework" subtitle="Loading homework...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Homework" subtitle="Error loading homework">
        <div className="text-red-500 text-center p-4">{error}</div>
      </Layout>
    );
  }
;

  const filteredHomework = homework.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'pending') return item.status === 'pending';
    if (filter === 'completed') return item.status === 'completed';
    if (filter === 'overdue') return item.status === 'overdue';
    return true;
  });

  const getStatusColor = (status: HomeworkItem['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusIcon = (status: HomeworkItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'overdue':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const formatExerciseParameters = (parameters: string): string => {
    try {
      const params = JSON.parse(parameters);
      const parts: string[] = [];

      if (params.exampleCount) {
        parts.push(`${params.exampleCount} examples`);
      }
      if (params.cardCount) {
        parts.push(`${params.cardCount} cards`);
      }
      if (params.digitType) {
        const digitTypeLabels: Record<string, string> = {
          'single-digit': 'Single-digit',
          'two-digit': 'Two-digit',
          'three-digit': 'Three-digit',
          'four-digit': 'Four-digit'
        };
        parts.push(digitTypeLabels[params.digitType] || params.digitType);
      }
      if (params.dividendDigits) {
        parts.push(`Dividend: ${params.dividendDigits[0]}-${params.dividendDigits[1]} digits`);
      }
      if (params.divisorDigits) {
        parts.push(`Divisor: ${params.divisorDigits[0]}-${params.divisorDigits[1]} digits`);
      }
      if (params.firstMultiplierDigits) {
        parts.push(`Multiplier: ${params.firstMultiplierDigits[0]}-${params.firstMultiplierDigits[1]} digits`);
      }
      if (params.minValue !== undefined && params.maxValue !== undefined) {
        parts.push(`Range: ${params.minValue}-${params.maxValue}`);
      }
      if (params.timePerQuestion) {
        const minutes = Math.floor(params.timePerQuestion / 60);
        const seconds = params.timePerQuestion % 60;
        if (minutes > 0) {
          parts.push(`Time: ${minutes}m ${seconds > 0 ? seconds + 's' : ''}`);
        } else {
          parts.push(`Time: ${seconds}s`);
        }
      }
      if (params.displaySpeed) {
        parts.push(`Speed: ${params.displaySpeed}s`);
      }
      if (params.theme) {
        parts.push(`Theme: ${params.theme}`);
      }

      return parts.length > 0 ? parts.join(' • ') : 'No parameters';
    } catch {
      return 'Invalid parameters';
    }
  };

  const handleSeeDetails = async (homeworkId: string) => {
    try {
      const homeworkDetail = await homeworkService.getHomeworkById(homeworkId);
      setSelectedHomework(homeworkDetail);
      
      // Load full exercise details to get parameters
      const exercisePromises = homeworkDetail.exercises.map(ex => 
        exerciseService.getExerciseById(ex.exerciseId)
      );
      const exercises = await Promise.all(exercisePromises);
      setSelectedHomeworkExercises(exercises);
      
      setShowDetailsModal(true);
    } catch (err: any) {
      console.error('[Homework] Failed to load homework details:', err);
      setError(err?.message || 'Failed to load homework details');
    }
  };

  const convertExerciseToConfig = (exercise: Exercise): ExerciseSessionConfig => {
    const params = JSON.parse(exercise.parameters || '{}');
    
    const config: ExerciseSessionConfig = {
      exerciseTypeId: exercise.exerciseTypeId,
      exerciseTypeName: exercise.exerciseTypeName,
    };

    // Copy all parameters from exercise
    if (params.timePerQuestion) config.timePerQuestion = params.timePerQuestion;
    if (params.displaySpeed) config.displaySpeed = params.displaySpeed;
    if (params.cardCount) config.cardCount = params.cardCount;
    if (params.exampleCount) config.exampleCount = params.exampleCount;
    if (params.dividendDigits) config.dividendDigits = params.dividendDigits;
    if (params.divisorDigits) config.divisorDigits = params.divisorDigits;
    if (params.firstMultiplierDigits) config.firstMultiplierDigits = params.firstMultiplierDigits;
    if (params.minValue !== undefined) config.minValue = params.minValue;
    if (params.maxValue !== undefined) config.maxValue = params.maxValue;
    if (params.digitLength) config.digitLength = params.digitLength;
    if (params.digitType) config.digitType = params.digitType;
    if (params.theme) config.theme = params.theme;
    if (params.min !== undefined) config.min = params.min;
    if (params.max !== undefined) config.max = params.max;

    return config;
  };

  const handleStartHomework = async (homeworkId: string) => {
    try {
      setLoadingExercise(true);
      const homeworkDetail = await homeworkService.getHomeworkById(homeworkId);

      if (!homeworkDetail.exercises || homeworkDetail.exercises.length === 0) {
        setError('This homework has no exercises assigned.');
        setLoadingExercise(false);
        return;
      }

      // If only one exercise, start it directly
      if (homeworkDetail.exercises.length === 1) {
        const exerciseId = homeworkDetail.exercises[0].exerciseId;
        const exercise = await exerciseService.getExerciseById(exerciseId);
        const config = convertExerciseToConfig(exercise);
        navigate('/exercises/play', { state: { config } });
      } else {
        // Multiple exercises - show selection modal
        setSelectedHomework(homeworkDetail);
        
        // Load full exercise details to get parameters
        const exercisePromises = homeworkDetail.exercises.map(ex => 
          exerciseService.getExerciseById(ex.exerciseId)
        );
        const exercises = await Promise.all(exercisePromises);
        setSelectedHomeworkExercises(exercises);
        
        setShowExerciseSelectionModal(true);
      }
    } catch (err: any) {
      console.error('[Homework] Failed to start homework:', err);
      setError(err?.message || 'Failed to start homework');
    } finally {
      setLoadingExercise(false);
    }
  };

  const handleSelectExercise = async (exerciseId: string) => {
    try {
      setLoadingExercise(true);
      const exercise = await exerciseService.getExerciseById(exerciseId);
      const config = convertExerciseToConfig(exercise);
      setShowExerciseSelectionModal(false);
      navigate('/exercises/play', { state: { config } });
    } catch (err: any) {
      console.error('[Homework] Failed to load exercise:', err);
      setError(err?.message || 'Failed to load exercise');
    } finally {
      setLoadingExercise(false);
    }
  };

  return (
    <Layout
      title="Homework"
      subtitle="Track and complete your assigned homework"
    >
      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${filter === 'all'
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-600 hover:bg-gray-100'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${filter === 'pending'
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${filter === 'completed'
              ? 'bg-green-100 text-green-600'
              : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${filter === 'overdue'
              ? 'bg-red-100 text-red-600'
              : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Overdue
        </button>
      </div>

      {/* Homework Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHomework.map((item) => (
          <div
            key={item.assignmentId || item.id}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative"
          >
            <button
              onClick={() => handleSeeDetails(item.id)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="See details"
            >
              <Info className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-blue-50 p-2 rounded-lg shrink-0">
                <Book className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <h3 className="font-semibold text-lg truncate">{item.title}</h3>
                <p className="text-gray-500 text-sm">Assigned by: {item.teacherName}</p>
              </div>
            </div>

            <div className={`self-start px-3 py-1 rounded-full text-sm flex items-center gap-2 mb-4 ${getStatusColor(item.status)}`}>
              {getStatusIcon(item.status)}
              <span className="capitalize">{item.status}</span>
            </div>
            
            <div className="space-y-4 mt-auto">
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {item.timeEstimate}
                </span>
                <span className="flex items-center gap-1">
                  Due: {new Date(item.dueDate).toLocaleDateString()}
                </span>
              </div>
              
              <button
                onClick={() => handleStartHomework(item.id)}
                disabled={item.status === 'completed' || loadingExercise}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${item.status === 'completed'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                {loadingExercise ? 'Loading...' : item.status === 'completed' ? 'Completed' : 'Start Now'}
              </button>
            </div>
          </div>
        ))}

        {filteredHomework.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl">
            <div className="text-gray-400 mb-2">
              <Book className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No homework found</h3>
            <p className="text-gray-500">
              {filter === 'completed' 
                ? "You haven't completed any homework yet"
                : filter === 'pending'
                ? "You don't have any pending homework"
                : filter === 'overdue'
                ? "You don't have any overdue homework"
                : "You don't have any homework assigned"}
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedHomework && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedHomework.title}</h2>
                <p className="text-sm text-gray-500">by {selectedHomework.teacherName}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {selectedHomework.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedHomework.description}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Exercises ({selectedHomework.exercises.length})</h3>
                <div className="space-y-2">
                  {selectedHomework.exercises.map((exercise, index) => {
                    const fullExercise = selectedHomeworkExercises.find(ex => ex.id === exercise.exerciseId);
                    return (
                      <div key={exercise.exerciseId} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{index + 1}. {exercise.exerciseTypeName}</p>
                            {fullExercise && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formatExerciseParameters(fullExercise.parameters)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleStartHomework(selectedHomework.id);
                }}
                disabled={loadingExercise}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-60"
              >
                {loadingExercise ? 'Loading...' : 'Start Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Selection Modal */}
      {showExerciseSelectionModal && selectedHomework && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowExerciseSelectionModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Choose Exercise</h2>
                <p className="text-sm text-gray-500">Select which exercise to start from {selectedHomework.title}</p>
              </div>
              <button
                onClick={() => setShowExerciseSelectionModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              {selectedHomework.exercises.map((exercise, index) => {
                const fullExercise = selectedHomeworkExercises.find(ex => ex.id === exercise.exerciseId);
                return (
                  <button
                    key={exercise.exerciseId}
                    onClick={() => handleSelectExercise(exercise.exerciseId)}
                    disabled={loadingExercise}
                    className="w-full text-left bg-gray-50 hover:bg-blue-50 rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 transition-all disabled:opacity-60"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{index + 1}. {exercise.exerciseTypeName}</p>
                        {fullExercise && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatExerciseParameters(fullExercise.parameters)}
                          </p>
                        )}
                      </div>
                      <div className="text-blue-600 font-medium">Start →</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}