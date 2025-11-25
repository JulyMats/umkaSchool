import { Target } from "lucide-react";
import { useEffect, useState } from "react";
import StatCard from "../StatCard";
import { useAuth } from "../../../contexts/AuthContext";
import { statsService } from "../../../services/stats.service";

export default function OverallProgress() {
  const { student } = useAuth();
  const [accuracyRate, setAccuracyRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!student?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get stats from backend API (uses latest snapshot for "all" period)
        const stats = await statsService.getStudentStats(student.id, 'all');
        setAccuracyRate(stats.accuracyRate);
      } catch (error) {
        console.error('Error fetching accuracy:', error);
        setAccuracyRate(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [student?.id]);

  if (loading) {
    return (
      <StatCard
        icon={<Target size={22} />}
        title="Accuracy"
        value="..."
        progress={0}
        subtitle="Loading..."
        color="blue"
      />
    );
  }

  const getSubtitle = () => {
    if (accuracyRate >= 90) return "Excellent work! You're a math master!";
    if (accuracyRate >= 75) return "You're doing great! Keep it up!";
    if (accuracyRate >= 60) return "Good progress! Keep practicing!";
    return "Keep practicing to improve your accuracy!";
  };

  return (
    <StatCard
      icon={<Target size={22} />}
      title="Accuracy"
      value={`${accuracyRate}%`}
      progress={accuracyRate}
      subtitle={getSubtitle()}
      color="blue"
    />
  );
}
