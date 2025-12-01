import { BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { homeworkService } from '../../services/homework.service';
import { Homework } from '../../types/homework';

export default function HomeworkList() {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomework = async () => {
      if (!student?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await homeworkService.getCurrentStudentHomework(student.id);
        // Get only pending homework for dashboard (limit to 3)
        const pending = data.filter(h => h.status === 'pending').slice(0, 3);
        setHomework(pending);
      } catch (error) {
        console.error('Error fetching homework:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomework();
  }, [student?.id]);

  const formatDueDate = (dueDate: string): string => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Overdue";
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  return (
    <div className="bg-pink-50 p-4 rounded-2xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-pink-700 flex items-center gap-2">
          <div className="bg-pink-100 p-1.5 rounded-full aspect-square flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-pink-700" />
          </div>
          Homework assigned to you
        </h3>
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/homework');
          }}
          className="text-sm text-pink-600 font-medium"
        >
          View all
        </a>
      </div>
      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading...</div>
      ) : homework.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No homework assigned</div>
      ) : (
        <ul>
          {homework.map((item) => (
            <li key={item.id} className="flex justify-between items-center bg-pink-100 p-3 rounded-xl mb-2">
              <div className="text-left flex-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-xs text-gray-500">{formatDueDate(item.dueDate)}</p>
              </div>
              <button 
                onClick={() => navigate('/homework')}
                className="bg-pink-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-pink-600 transition-colors"
              >
                Start
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
