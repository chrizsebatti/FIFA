import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import ConfirmModal from '../../components/ConfirmModal';
import { DeleteIcon, EditIcon } from '../../components/ActionIcons';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => currentYear - 3 + i);

function monthName(n) {
  return MONTHS.find((m) => m.value === n)?.label || String(n);
}

function formatAmount(n) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

export default function GroundRent() {
  const [members, setMembers] = useState([]);
  const [rents, setRents] = useState([]);
  const [overview, setOverview] = useState(null);

  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(currentYear));
  const [editingId, setEditingId] = useState(null);

  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');

  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMembers = useCallback(async () => {
    const res = await api.get('/admin/members');
    setMembers(res.data.members || []);
  }, []);

  const loadOverview = useCallback(async () => {
    const res = await api.get('/admin/ground-rent/overview');
    setOverview(res.data);
  }, []);

  const loadRents = useCallback(async () => {
    setListLoading(true);
    setError('');
    try {
      const params = { sort };
      if (filterMonth) params.month = filterMonth;
      if (filterYear) params.year = filterYear;
      if (search.trim()) params.q = search.trim();
      const res = await api.get('/admin/ground-rent', { params });
      setRents(res.data.rents || []);
    } catch {
      setError('Failed to load ground rent records');
    } finally {
      setListLoading(false);
    }
  }, [filterMonth, filterYear, search, sort]);

  useEffect(() => {
    loadMembers().catch(() => setError('Failed to load members'));
    loadOverview().catch(() => {});
  }, [loadMembers, loadOverview]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadRents();
    }, 200);
    return () => clearTimeout(t);
  }, [loadRents]);

  const resetForm = () => {
    setMemberId('');
    setAmount('');
    setMonth(String(new Date().getMonth() + 1));
    setYear(String(currentYear));
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        memberId,
        amount: Number(amount),
        month: Number(month),
        year: Number(year),
      };
      if (editingId) {
        const previous = rents.find((r) => r._id === editingId);
        await api.put(`/admin/ground-rent/${editingId}`, payload);
        if (previous) {
          applyOverviewDelta(previous.amount, previous.month, previous.year, -1);
        }
        applyOverviewDelta(payload.amount, payload.month, payload.year, 1);
      } else {
        await api.post('/admin/ground-rent', payload);
        applyOverviewDelta(payload.amount, payload.month, payload.year, 1);
      }
      resetForm();
      await Promise.all([loadRents(), loadOverview()]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save ground rent');
      await loadOverview().catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (rent) => {
    setEditingId(rent._id);
    setMemberId(rent.member?._id || '');
    setAmount(String(rent.amount));
    setMonth(String(rent.month));
    setYear(String(rent.year));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    const removed = deleteTarget;
    try {
      await api.delete(`/admin/ground-rent/${removed._id}`);
      applyOverviewDelta(removed.amount, removed.month, removed.year, -1);
      setRents((prev) => prev.filter((r) => r._id !== removed._id));
      if (editingId === removed._id) resetForm();
      setDeleteTarget(null);
      await Promise.all([loadRents(), loadOverview()]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete record');
      setDeleteTarget(null);
      await loadOverview().catch(() => {});
    } finally {
      setDeleting(false);
    }
  };

  const overviewMonthLabel = useMemo(() => {
    if (!overview) return '—';
    return `${monthName(overview.currentMonth)} ${overview.currentYear}`;
  }, [overview]);

  const filteredTotal = useMemo(
    () => rents.reduce((sum, rent) => sum + Number(rent.amount || 0), 0),
    [rents]
  );

  const applyOverviewDelta = (amount, monthNum, yearNum, sign) => {
    const delta = sign * Number(amount || 0);
    setOverview((prev) => {
      if (!prev) return prev;
      const isCurrent =
        Number(monthNum) === prev.currentMonth && Number(yearNum) === prev.currentYear;
      return {
        ...prev,
        totalCollected: Math.max(0, Number(prev.totalCollected || 0) + delta),
        currentMonthCollected: isCurrent
          ? Math.max(0, Number(prev.currentMonthCollected || 0) + delta)
          : prev.currentMonthCollected,
      };
    });
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-primary">Ground Rent</h1>
      <p className="mt-1 text-sm text-gray-500">Collect and track monthly ground fees</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total members</p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {overview ? overview.totalMembers : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total Ground fee collected</p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {listLoading ? '—' : formatAmount(filteredTotal)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Current month ({overviewMonthLabel})
          </p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {overview ? formatAmount(overview.currentMonthCollected) : '—'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-1 block text-sm text-gray-600">Member</label>
            <select
              required
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary"
            >
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Amount</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-primary"
              placeholder="0"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Month</label>
            <select
              required
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Year</label>
            <select
              required
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={loading || members.length === 0}
            className="min-h-[44px] rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50"
          >
            {loading ? 'Saving...' : editingId ? 'Update fee' : 'Add fee'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="min-h-[44px] rounded-lg border border-gray-200 px-4 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
        {members.length === 0 && (
          <p className="text-sm text-gray-500">Add members first before recording ground rent.</p>
        )}
      </form>

      <div className="mt-6 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm text-gray-600">Search by name</label>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Member name"
            className="w-full min-h-[44px] rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600">Filter by month</label>
          <div className="flex gap-2">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="min-h-[44px] flex-1 rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm outline-none focus:border-primary"
            >
              <option value="">All months</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="min-h-[44px] w-28 rounded-lg border border-gray-200 bg-white px-2 pr-10 text-sm outline-none focus:border-primary"
            >
              <option value="">Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600">Sort by name</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm outline-none focus:border-primary"
          >
            <option value="name">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        {listLoading ? (
          <p className="p-6 text-center text-sm text-gray-500">Loading records...</p>
        ) : rents.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">No ground rent records found</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Month</th>
                <th className="px-4 py-3 font-medium">Year</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rents.map((rent) => (
                <tr key={rent._id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {rent.member?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatAmount(rent.amount)}</td>
                  <td className="px-4 py-3 text-gray-600">{monthName(rent.month)}</td>
                  <td className="px-4 py-3 text-gray-600">{rent.year}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEdit(rent)}
                        className="rounded-lg border border-gray-200 p-2 text-primary hover:border-primary hover:bg-primary/5"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(rent)}
                        className="rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50"
                        aria-label="Delete"
                        title="Delete"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete ground rent?"
        message={
          deleteTarget
            ? `Delete fee for “${deleteTarget.member?.name || 'member'}” (${monthName(deleteTarget.month)} ${deleteTarget.year})?`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
