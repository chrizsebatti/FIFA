import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Join() {
  const { join } = useAuth();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await join(phoneNumber, displayName);
      navigate('/matches');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showNav={false}>
      <div className="flex min-h-[70dvh] flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mb-2 text-5xl">⚽</div>
          <h2 className="text-2xl font-bold text-fifa-gold">FIFA WC 2026</h2>
          <p className="mt-2 text-white/60">Predict winners & scores to earn points</p>
        </div>

        <div className="mb-6 rounded-xl bg-white/5 p-4 text-sm text-white/70">
          <p className="font-medium text-fifa-gold">Scoring</p>
          <ul className="mt-2 space-y-1">
            <li>✓ Correct winner → 50 points</li>
            <li>✓ Correct winner + exact score → 100 points</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/70">Phone Number</label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 234 567 8900"
              className="w-full min-h-[48px] rounded-xl border border-white/10 bg-white/5 px-4 outline-none focus:border-fifa-gold"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">
              Display Name <span className="text-white/40">(optional)</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your nickname"
              className="w-full min-h-[48px] rounded-xl border border-white/10 bg-white/5 px-4 outline-none focus:border-fifa-gold"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] rounded-xl bg-fifa-green font-semibold transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join & Start Predicting'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
