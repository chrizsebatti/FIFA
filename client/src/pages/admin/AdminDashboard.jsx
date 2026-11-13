import { useEffect, useState } from 'react';
import api from '../../api/client';
import SideDrawer from '../../components/SideDrawer';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatAmount(n) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [finance, setFinance] = useState(null);
  const [error, setError] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerEntries, setDrawerEntries] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rentRes, financeRes] = await Promise.all([
          api.get('/admin/ground-rent/overview'),
          api.get('/admin/finance/overview'),
        ]);
        if (!cancelled) {
          setOverview(rentRes.data);
          setFinance(financeRes.data);
        }
      } catch {
        if (!cancelled) setError('Failed to load overview');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openFinanceDrawer = async (type) => {
    const titles = {
      credit: 'Total credit',
      debit: 'Total debit',
      all: 'Balance',
    };
    setDrawerTitle(titles[type] || 'Finance details');
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerError('');
    setDrawerEntries([]);
    try {
      const params = { sort: 'title' };
      if (type === 'credit' || type === 'debit') params.type = type;
      const res = await api.get('/admin/finance/entries', { params });
      setDrawerEntries(res.data.entries || []);
    } catch {
      setDrawerError('Failed to load entries');
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerEntries([]);
    setDrawerError('');
  };

  const monthLabel = overview
    ? `${MONTHS[overview.currentMonth - 1]} ${overview.currentYear}`
    : '—';

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">SOCCER EDATHIRINJI overview</p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total members</p>
          <p className="mt-2 text-3xl font-bold text-primary">
            {overview ? overview.totalMembers : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total Ground fee collected</p>
          <p className="mt-2 text-3xl font-bold text-primary">
            {overview ? formatAmount(overview.totalCollected) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Current month ({monthLabel})
          </p>
          <p className="mt-2 text-3xl font-bold text-primary">
            {overview ? formatAmount(overview.currentMonthCollected) : '—'}
          </p>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-bold text-primary">Finance</h2>
      <p className="mt-1 text-sm text-gray-500">Overall financial stats across all categories</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => openFinanceDrawer('credit')}
          className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-primary hover:shadow"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total credit</p>
          <p className="mt-2 text-3xl font-bold text-primary">
            {finance ? formatAmount(finance.totalCredit) : '—'}
          </p>
        </button>
        <button
          type="button"
          onClick={() => openFinanceDrawer('debit')}
          className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-primary hover:shadow"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total debit</p>
          <p className="mt-2 text-3xl font-bold text-primary">
            {finance ? formatAmount(finance.totalDebit) : '—'}
          </p>
        </button>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Balance</p>
          <p className="mt-2 text-3xl font-bold text-primary">
            {finance ? formatAmount(finance.balance) : '—'}
          </p>
        </div>
      </div>

      <SideDrawer open={drawerOpen} title={drawerTitle} onClose={closeDrawer}>
        {drawerLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : drawerError ? (
          <p className="text-sm text-red-600">{drawerError}</p>
        ) : drawerEntries.length === 0 ? (
          <p className="text-sm text-gray-500">No entries found</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Title</th>
                  <th className="px-3 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {drawerEntries.map((entry) => (
                  <tr key={entry._id} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-3 font-medium text-primary">
                      {entry.category?.name || '—'}
                    </td>
                    <td className="px-3 py-3 text-gray-900">{entry.title}</td>
                    <td className="px-3 py-3 text-right font-semibold text-gray-900">
                      {formatAmount(entry.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
