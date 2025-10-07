import { BarChart3 } from "lucide-react";
import StatCard from "../StatCard";

export default function OverallProgress() {
  return (
    <StatCard
      icon={<BarChart3 size={16} />}
      title="Overall Progress"
      value="72%"
      progress={72}
      subtitle="You're doing great! Keep it up!"
      color="blue"
    />
  );
}
