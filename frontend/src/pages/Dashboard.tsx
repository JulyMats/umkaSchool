import Layout from "../components/Layout";
import ProblemSolved from "../components/Dashboard/StatCards/ProblemsSolved";
import ActivityStreak from "../components/Dashboard/StatCards/ActivityStreak";
import OverallProgress from "../components/Dashboard/StatCards/OverallProgress";
import HomeworkList from "../components/Dashboard/HomeworkList";
import DailyChallenge from "../components/Dashboard/DailyChallenge";

export default function Dashboard() {
  return (
    <Layout 
      title="Welcome back, Alex!"
      subtitle="Let's practice some mental arithmetic today"
    >
      <div className="grid grid-cols-3 gap-6">
        <ProblemSolved />
        <ActivityStreak />
        <OverallProgress />
      </div>
      <div className="grid grid-cols-2 gap-6 mt-8">
        <HomeworkList />
        <DailyChallenge />
      </div>
    </Layout>
  );
}
