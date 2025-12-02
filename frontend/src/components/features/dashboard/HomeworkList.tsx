import { BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { homeworkService } from '../../../services/homework.service';
import { Homework } from '../../../types/homework';
import { LoadingState, SectionHeader, EmptyState } from '../../../components/common';
import { Card } from '../../../components/ui';
import { HomeworkListItem } from '../../features/homework';

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


  return (
    <Card variant="pink">
      <SectionHeader
        icon={BookOpen}
        title="Homework assigned to you"
        action={{
          label: 'View all',
          onClick: () => navigate('/homework')
        }}
        color="pink"
      />
      {loading ? (
        <LoadingState message="Loading homework..." size="sm" />
      ) : homework.length === 0 ? (
        <EmptyState
          message="No homework assigned yet"
        />
      ) : (
        <ul>
          {homework.map((item) => (
            <HomeworkListItem
              key={item.id}
              homework={item}
              onStart={() => navigate('/homework')}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}

