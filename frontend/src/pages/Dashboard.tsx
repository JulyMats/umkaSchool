import Layout from "../components/layout";
import { ProblemsSolved, ActivityStreak, OverallProgress, HomeworkList, DailyChallenge } from "../components/features/dashboard";
import { useAuth } from "../contexts/AuthContext";
import { getDisplayName } from "../utils/user.utils";
import bearAvatar from "../assets/avatar.png";

export default function Dashboard() {
  const { student, user, teacher } = useAuth();
  const studentName = getDisplayName(user, student, teacher, 'Student');

  return (
    <Layout 
      title={`Welcome back, ${studentName}!`}
      subtitle="Let's practice some mental arithmetic today"
    >
      {/* Welcome Section with Stats */}
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        <div className="flex-shrink-0 mx-auto md:mx-0">
          <img 
            src={bearAvatar} 
            alt="Umka Bear" 
            className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 w-full">
          <ProblemsSolved />
          <ActivityStreak />
          <div className="md:col-start-2">
            <OverallProgress />
          </div>
        </div>
      </div>

      {/* Homework and Daily Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HomeworkList />
        <DailyChallenge />
      </div>
    </Layout>
  );
}
