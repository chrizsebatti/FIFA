import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

export default function RequireAdmin({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin', { replace: true });
    }
  }, [token, navigate]);

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
