import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Exercises from "./pages/Exercises";
import ExerciseSetup from "./pages/ExerciseSetup";
import ExercisePlay from "./pages/ExercisePlay";
import Progress from "./pages/Progress";
import Homework from "./pages/Homework";
import DailyChallenge from "./pages/DailyChallenge";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import StudentProfileCompletion from "./pages/StudentProfileCompletion";
import TeacherProfileCompletion from "./pages/TeacherProfileCompletion";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherStudents from "./pages/TeacherStudents";
import TeacherGroups from "./pages/TeacherGroups";
import TeacherHomework from "./pages/TeacherHomework";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./App.css";

function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth();

  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  const renderProtectedRoutes = () => {
    if (user?.role === 'TEACHER') {
      return (
        <>
          <Route path="/dashboard" element={<TeacherDashboard />} />
          <Route path="/students" element={<TeacherStudents />} />
          <Route path="/groups" element={<TeacherGroups />} />
          <Route path="/homework" element={<TeacherHomework />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      );
    }

    return (
      <>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/homework" element={<Homework />} />
        <Route path="/challenges" element={<DailyChallenge />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" replace />} />
        <Route path="/reset-password" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
        <Route path="/complete-profile/student" element={!isAuthenticated ? <StudentProfileCompletion /> : <Navigate to="/" replace />} />
        <Route path="/complete-profile/teacher" element={!isAuthenticated ? <TeacherProfileCompletion /> : <Navigate to="/" replace />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Routes>
                {/* Routes without sidebar */}
                <Route path="/exercises/:exerciseTypeId/setup" element={<ExerciseSetup />} />
                <Route path="/exercises/play" element={<ExercisePlay />} />
                
                {/* Routes with sidebar */}
                <Route
                  path="*"
                  element={
                    <div className="flex h-screen overflow-hidden">
                      <Sidebar />
                      <main className="flex-1 bg-gray-50 overflow-y-auto ml-64">
                        <Routes>
                          {renderProtectedRoutes()}
                        </Routes>
                      </main>
                    </div>
                  }
                />
              </Routes>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
