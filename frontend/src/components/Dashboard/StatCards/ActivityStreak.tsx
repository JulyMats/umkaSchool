import { Clock3 } from "lucide-react";
import StatCard from "../StatCard";

export default function ActivityStreak() {
  return (
    <StatCard
      icon={<Clock3 size={16} />}
      title="Activity Streak"
      value="7 days"
      progress={70}
      subtitle="3 more days to reach your best streak"
      color="purple"
    />
  );
}
