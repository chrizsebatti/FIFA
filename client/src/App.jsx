import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import FootballLoader from './components/FootballLoader';
import Join from './pages/Join';
import Matches from './pages/Matches';
import Predict from './pages/Predict';
import Leaderboard from './pages/Leaderboard';
import MyPredictions from './pages/MyPredictions';
import Profile from './pages/Profile';
import FanShed from './pages/FanShed';
import RoadToTrophy from './pages/RoadToTrophy';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/" replace state={{ from: returnTo }} />;
  }
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  return (
    <>
      <FootballLoader show={loading} />
      <Routes>
      <Route path="/" element={user ? <Navigate to="/matches" replace /> : <Join />} />
      <Route
        path="/matches"
        element={
          <ProtectedRoute>
            <Matches />
          </ProtectedRoute>
        }
      />
      <Route
        path="/matches/:id/predict"
        element={
          <ProtectedRoute>
            <Predict />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-predictions"
        element={
          <ProtectedRoute>
            <MyPredictions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/road-to-trophy"
        element={
          <ProtectedRoute>
            <RoadToTrophy />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fan-shed"
        element={
          <ProtectedRoute>
            <FanShed />
          </ProtectedRoute>
        }
      />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
