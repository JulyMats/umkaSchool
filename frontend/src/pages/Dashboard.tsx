import Layout from "../components/Layout";
import ProblemSolved from "../components/Dashboard/StatCards/ProblemsSolved";
import ActivityStreak from "../components/Dashboard/StatCards/ActivityStreak";
import OverallProgress from "../components/Dashboard/StatCards/OverallProgress";
import HomeworkList from "../components/Dashboard/HomeworkList";
import DailyChallenge from "../components/Dashboard/DailyChallenge";
import { useAuth } from "../contexts/AuthContext";
import bearAvatar from "../assets/avatar.png";

export default function Dashboard() {
  const { student, user } = useAuth();
  const studentName = student?.firstName || user?.firstName || 'Student';

  return (
    <Layout 
      title={`Welcome back, ${studentName}!`}
      subtitle="Let's practice some mental arithmetic today"
    >
      <div className="flex items-start gap-6 mb-8">
        <div className="flex-shrink-0">
          <img 
            src={bearAvatar} 
            alt="Umka Bear" 
            className="w-64 h-64 rounded-full object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-6 flex-1">
          <ProblemSolved />
          <ActivityStreak />
          <div className="col-start-2">
            <OverallProgress />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 mt-8">
        <HomeworkList />
        <DailyChallenge />
      </div>
    </Layout>
  );
}
