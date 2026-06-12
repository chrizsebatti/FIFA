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
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="border-b border-[#FF6D00]/25 bg-gradient-to-b from-[#FF6D00]/15 via-[#FF6D00]/8 to-white px-4 py-3 shadow-sm">
        <h1 className="text-center text-lg font-bold text-[#FF6D00]">FIFA WC 2026</h1>
        <p className="text-center text-xs text-gray-600">Admin</p>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <h2 className="mb-6 text-center text-xl font-bold text-gray-900">Admin Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <label className="mb-1 block text-sm text-gray-600">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-gray-200 bg-gray-50 px-3 outline-none focus:border-[#FF6D00]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-gray-200 bg-gray-50 px-3 outline-none focus:border-[#FF6D00]"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] rounded-lg bg-[#FF6D00] font-semibold text-white disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 w-full text-center text-sm text-gray-400 hover:text-[#FF6D00]"
          >
            ← Back to app
          </button>
        </div>
      </div>
    </div>
  );
}
