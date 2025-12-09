import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import StatCard from "../StatCard";
import { useAuth } from "../../../../contexts/AuthContext";
import { statsService } from "../../../../services/stats.service";

export default function ActivityStreak() {
  const { student } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!student?.id) {
        setLoading(false);
        return;
      }

      try {
        const stats = await statsService.getStudentStats(student.id, 'all');
        setCurrentStreak(stats.currentStreak);
        setBestStreak(stats.bestStreak);
      } catch (error) {
        console.error('Error fetching streak:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [student?.id]);

  const progress = bestStreak > 0 ? Math.min(Math.round((currentStreak / bestStreak) * 100), 100) : 0;
  const remaining = Math.max(bestStreak - currentStreak, 0);

  if (loading) {
    return (
      <StatCard
        icon={<Clock3 size={22} />}
        title="Activity Streak"
        value="..."
        progress={0}
        subtitle="Loading..."
        color="purple"
      />
    );
  }

  return (
    <StatCard
      icon={<Clock3 size={22} />}
      title="Activity Streak"
      value={`${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}`}
      progress={progress}
      subtitle={remaining > 0 ? `${remaining} more days to reach your best streak` : `Your best streak is ${bestStreak} days!`}
      color="purple"
    />
  );
}

