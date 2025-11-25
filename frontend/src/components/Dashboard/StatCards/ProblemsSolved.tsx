import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import StatCard from "../StatCard";
import { useAuth } from "../../../contexts/AuthContext";
import { statsService } from "../../../services/stats.service";

export default function ProblemsSolved() {
  const { student } = useAuth();
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!student?.id) {
        setLoading(false);
        return;
      }

      try {
        const stats = await statsService.getStudentStats(student.id, 'all');
        setProblemsSolved(stats.problemsSolved);
      } catch (error) {
        console.error('Error fetching problems solved:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [student?.id]);

  const goal = 500;
  const progress = goal > 0 ? Math.min(Math.round((problemsSolved / goal) * 100), 100) : 0;
  const remaining = Math.max(goal - problemsSolved, 0);

  if (loading) {
    return (
      <StatCard
        icon={<CheckCircle size={22} />}
        title="Problems Solved"
        value="..."
        progress={0}
        subtitle="Loading..."
        color="pink"
      />
    );
  }

  return (
    <StatCard
      icon={<CheckCircle size={22} />}
      title="Problems Solved"
      value={problemsSolved}
      progress={progress}
      subtitle={remaining > 0 ? `${remaining} more to reach your ${goal} goal` : `Congratulations! You've reached your goal!`}
      color="pink"
    />
  );
}
