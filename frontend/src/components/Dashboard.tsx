import Header from "./Dashboard/Header";
import ProblemSolved from "./Dashboard/StatCards/ProblemsSolved";
import ActivityStreak from "./Dashboard/StatCards/ActivityStreak";
import OverallProgress from "./Dashboard/StatCards/OverallProgress";
import HomeworkList from "./Dashboard/HomeworkList";
import DailyChallenge from "./Dashboard/DailyChallenge";

export default function Dashboard() {
  return (
    <div className="flex-1 p-6 overflow-auto bg-white">
      <Header />
      <div className="grid grid-cols-3 gap-6 mt-8">
        <ProblemSolved />
        <ActivityStreak />
        <OverallProgress />
      </div>
      <div className="grid grid-cols-2 gap-6 mt-8">
        <HomeworkList />
        <DailyChallenge />
      </div>
    </div>
  );
}
