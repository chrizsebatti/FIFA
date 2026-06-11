import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { username, password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/dashboard');
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-fifa-dark px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-fifa-gold">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
          <div>
            <label className="mb-1 block text-sm text-white/70">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-white/10 bg-white/5 px-3 outline-none focus:border-fifa-gold"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-white/10 bg-white/5 px-3 outline-none focus:border-fifa-gold"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] rounded-lg bg-fifa-green font-semibold disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full text-center text-sm text-white/40 hover:text-white/70"
        >
          ← Back to app
        </button>
      </div>
    </div>
  );
}
