import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, showNav = true }) {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { to: '/matches', label: 'Matches', icon: '⚽' },
    { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { to: '/my-predictions', label: 'My Picks', icon: '📋' },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-fifa-dark/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-fifa-gold">FIFA WC 2026</h1>
            {user && (
              <p className="text-xs text-white/60">
                {user.displayName || user.phoneNumber} · {user.totalPoints} pts
              </p>
            )}
          </div>
          <Link to="/admin" className="text-xs text-white/40 hover:text-white/70">
            Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 pb-24">{children}</main>

      {showNav && user && (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-fifa-dark/95 backdrop-blur">
          <div className="mx-auto flex max-w-lg">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition ${
                    active ? 'text-fifa-gold' : 'text-white/50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
