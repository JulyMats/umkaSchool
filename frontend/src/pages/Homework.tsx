import { useState, useEffect } from 'react';
import Layout from "../components/Layout";
import { Clock, CheckCircle, XCircle, Book } from 'lucide-react';
import { homeworkService, Homework as HomeworkItem } from '../services/homework.service';

// TODO: Replace this with actual student ID from authentication context
const CURRENT_STUDENT_ID = "bd09a8cb-1596-415f-bd20-6702957193aa";

export default function Homework() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        const data = await homeworkService.getCurrentStudentHomework(CURRENT_STUDENT_ID);
        setHomework(data);
        setError(null);
      } catch (err) {
        setError('Failed to load homework. Please try again later.');
        console.error('Error fetching homework:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomework();
  }, []);

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
    return item.status === 'completed';
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
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Completed
        </button>
      </div>

      {/* Homework Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHomework.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-blue-50 p-2 rounded-lg shrink-0">
                <Book className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
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
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${item.status === 'completed'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                disabled={item.status === 'completed'}
              >
                {item.status === 'completed' ? 'Completed' : 'Start Now'}
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
                : "You don't have any homework assigned"}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}