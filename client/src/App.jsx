import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Join from './pages/Join';
import Matches from './pages/Matches';
import Predict from './pages/Predict';
import Leaderboard from './pages/Leaderboard';
import MyPredictions from './pages/MyPredictions';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-fifa-dark">
        <p className="text-white/50">Loading...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-fifa-dark">
        <p className="text-white/50">Loading...</p>
      </div>
    );
  }

  return (
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
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
