import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import Chat from "./pages/Chat";
import Achievements from "./pages/Achievements";
import PublicProfile from "./pages/PublicProfile";
import DietTracker from "./pages/DietTracker";
import Exercises from "./pages/Exercises";
import TeamPage from "./pages/TeamPage";
import VerifyOTP from "./pages/VerifyOTP";
import Teams from "./pages/Teams";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );
  if (!user) return <Navigate to="/login" />;

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/profile/:userId" element={<PublicProfile />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/achievements"
        element={
          <ProtectedRoute>
            <Achievements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diet"
        element={
          <ProtectedRoute>
            <DietTracker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercises"
        element={
          <ProtectedRoute>
            <Exercises />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams"
        element={
          <ProtectedRoute>
            <Teams />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
