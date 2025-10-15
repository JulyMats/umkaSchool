import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Exercises from "./pages/Exercises";
import Progress from "./pages/Progress";
import Homework from "./pages/Homework";
import DailyChallenge from "./pages/DailyChallenge";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./App.css";

function AppContent() {
  const { isAuthenticated } = useAuth();

  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
        
        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 bg-gray-50">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/exercises" element={<Exercises />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/homework" element={<Homework />} />
                    <Route path="/challenges" element={<DailyChallenge />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
              </div>
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
