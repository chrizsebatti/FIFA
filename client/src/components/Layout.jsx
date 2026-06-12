import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NavIcon } from './NavIcons';

const navItems = [
  { to: '/matches', label: 'Matches', icon: 'matches' },
  { to: '/leaderboard', label: 'Board', icon: 'board' },
  { to: '/my-predictions', label: 'My Picks', icon: 'picks' },
  { to: '/fan-shed', label: 'Fans', icon: 'fans' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
];

export default function Layout({
  children,
  showNav = true,
  hideHeader = false,
  banner,
  theme = 'light',
}) {
  const location = useLocation();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  return (
    <div className={`flex min-h-dvh flex-col ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      {!hideHeader && (
        <header className="sticky top-0 z-10 border-[#FF6D00]/25 bg-gradient-to-b from-[#FF6D00]/20 via-[#FF6D00]/10 to-white px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] backdrop-blur">
          <div className="mx-auto flex max-w-lg items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-[#FF6D00]">FIFA WC 2026</h1>
              {user && (
                <Link
                  to="/profile"
                  className="text-xs text-gray-600 hover:text-[#FF6D00]"
                >
                  {user.displayName || user.phoneNumber} ·{' '}
                  <span
                    className={`font-semibold ${
                      user.totalPoints === 0 ? 'text-red-600' : 'text-[#008631]'
                    }`}
                  >
                    {user.totalPoints} pts
                  </span>
                </Link>
              )}
            </div>
            <Link
              to="/admin"
              className="rounded-full border border-[#FF6D00] bg-white/80 px-3 py-1 text-xs font-medium text-[#FF6D00] shadow-sm transition hover:bg-[#FF6D00]/5"
            >
              Admin
            </Link>
          </div>
        </header>
      )}

      {banner && (
        <div className="relative">
          <img
            src={banner}
            alt=""
            className="block max-h-[min(40vh,360px)] w-full object-cover object-bottom pt-[env(safe-area-inset-top)]"
          />
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent ${
              isDark
                ? 'from-[#0a0a0a] via-[#0a0a0a]/55'
                : 'from-white via-white/50'
            }`}
            aria-hidden="true"
          />
        </div>
      )}

      <main
        className={`mx-auto w-full max-w-lg flex-1 px-4 pb-24 ${
          banner ? '-mt-6 pt-0' : 'py-4'
        }`}
      >
        {children}
      </main>

      {showNav && user && (
        <nav
          className={`fixed bottom-0 left-0 right-0 z-10 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-md ${
            isDark
              ? 'border-gray-800 bg-[#0a0a0a]/95 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]'
              : 'border-gray-200 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'
          }`}
        >
          <div className="mx-auto flex max-w-lg items-stretch px-1">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-2.5 transition-colors ${
                    active
                      ? 'text-[#FF6D00]'
                      : isDark
                        ? 'text-gray-500 hover:text-gray-300'
                        : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span
                    className={`flex h-9 w-14 items-center justify-center rounded-2xl transition-colors ${
                      active ? 'bg-[#FF6D00]/12' : ''
                    }`}
                  >
                    <NavIcon name={item.icon} className="h-6 w-6" />
                  </span>
                  <span
                    className={`truncate text-[10px] leading-none ${
                      active ? 'font-semibold' : 'font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
