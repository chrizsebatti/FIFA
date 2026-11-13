import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', end: true },
  { to: '/admin/members', label: 'Members' },
  { to: '/admin/ground-rent', label: 'Ground Rent' },
  { to: '/admin/finance', label: 'Finance' },
];

function BrandMark({ logoClassName = 'h-11 w-11', nameClassName = 'text-sm' }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <BrandLogo className={`shrink-0 ${logoClassName}`} />
      <div className="min-w-0">
        <p className={`whitespace-nowrap font-bold leading-tight text-white ${nameClassName}`}>
          SOCCER EDATHIRINJI
        </p>
        <p className="mt-0.5 text-xs font-normal text-white/70">Admin</p>
      </div>
    </div>
  );
}

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-primary/10 hover:text-primary'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="flex min-h-dvh bg-white">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="border-b border-primary/15 bg-primary px-3 py-3">
          <BrandMark />
        </div>
        <div className="flex flex-1 flex-col">
          <NavLinks />
          <div className="mt-auto border-t border-gray-100 p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-primary hover:text-primary"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 bg-primary px-3 py-2 md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-1.5 text-white hover:bg-primary-light"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <BrandMark logoClassName="h-9 w-9" nameClassName="text-xs sm:text-sm" />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-lg border border-white/30 px-2.5 py-1 text-xs text-white"
          >
            Logout
          </button>
        </header>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between gap-2 border-b border-primary/15 bg-primary px-3 py-3">
                <BrandMark logoClassName="h-10 w-10" />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="shrink-0 rounded-lg p-1 text-white hover:bg-primary-light"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                    <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <NavLinks onNavigate={() => setMenuOpen(false)} />
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
