import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/layout";
import ErrorBoundary from "./components/common/ErrorBoundary";
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
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherStudents from "./pages/TeacherStudents";
import TeacherGroups from "./pages/TeacherGroups";
import TeacherHomework from "./pages/TeacherHomework";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTeachers from "./pages/AdminTeachers";
import Profile from "./pages/Profile";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SidebarProvider, useSidebar } from "./contexts/SidebarContext";
import "./App.css";

function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const sidebarContext = useSidebar();
  const sidebarOpen = sidebarContext?.isOpen ?? false;
  const handleCloseSidebar = sidebarContext?.closeSidebar ?? (() => {});

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

  // Wait for user data to load before rendering routes
  if (isAuthenticated && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  const renderProtectedRoutes = () => {
    if (user?.role === 'ADMIN') {
      return (
        <>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/teachers" element={<AdminTeachers />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      );
    }

    if (user?.role === 'TEACHER') {
      return (
        <>
          <Route path="/dashboard" element={<TeacherDashboard />} />
          <Route path="/students" element={<TeacherStudents />} />
          <Route path="/groups" element={<TeacherGroups />} />
          <Route path="/homework" element={<TeacherHomework />} />
          <Route path="/profile" element={<Profile />} />
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
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" replace />} />
        <Route path="/reset-password" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} />

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
                    <div className="flex h-screen overflow-hidden relative">
                      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
                      <main className="flex-1 bg-gray-50 overflow-y-auto lg:ml-64 w-full">
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
    <ErrorBoundary>
      <AuthProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
