import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin', { replace: true });
  };

  if (!localStorage.getItem('adminToken')) {
    return null;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-secondary">
      <header className="flex items-center justify-between bg-primary px-4 py-3">
        <h1 className="text-lg font-bold text-secondary">Admin</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-secondary/40 px-3 py-1.5 text-sm text-secondary hover:bg-primary-light"
        >
          Logout
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <p className="text-center text-3xl font-bold tracking-wide text-primary sm:text-4xl">
          SOCCER EDATHIRINJI
        </p>
      </main>
    </div>
  );
}
