import { CheckCircle } from "lucide-react";
import StatCard from "../StatCard";

export default function ProblemsSolved() {
  return (
    <StatCard
      icon={<CheckCircle size={16} />}
      title="Problems Solved"
      value={328}
      progress={65}
      subtitle="172 more to reach your 500 goal"
      color="pink"
    />
  );
}
