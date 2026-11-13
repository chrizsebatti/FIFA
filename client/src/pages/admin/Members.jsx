import { useCallback, useEffect, useState } from 'react';
import api from '../../api/client';
import ConfirmModal from '../../components/ConfirmModal';
import { DeleteIcon, EditIcon } from '../../components/ActionIcons';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMembers = useCallback(async () => {
    setListLoading(true);
    setError('');
    try {
      const params = { sort };
      if (search.trim()) params.q = search.trim();
      const res = await api.get('/admin/members', { params });
      setMembers(res.data.members || []);
    } catch {
      setError('Failed to load members');
    } finally {
      setListLoading(false);
    }
  }, [search, sort]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadMembers();
    }, 200);
    return () => clearTimeout(t);
  }, [loadMembers]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/admin/members/${editingId}`, { name, phone });
      } else {
        await api.post('/admin/members', { name, phone });
      }
      resetForm();
      await loadMembers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (member) => {
    setEditingId(member._id);
    setName(member.name);
    setPhone(member.phone);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/admin/members/${deleteTarget._id}`);
      if (editingId === deleteTarget._id) resetForm();
      setDeleteTarget(null);
      await loadMembers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete member');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-primary">Members</h1>
      <p className="mt-1 text-sm text-gray-500">Add and manage club members</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-primary"
              placeholder="Member name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Phone</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-primary"
              placeholder="Phone number"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50"
          >
            {loading ? 'Saving...' : editingId ? 'Update member' : 'Add member'}
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
      </form>

      <div className="mt-6 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2">
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
          <label className="mb-1 block text-sm text-gray-600">Sort by name</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary"
          >
            <option value="name">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        {listLoading ? (
          <p className="p-6 text-center text-sm text-gray-500">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">
            {search.trim() ? 'No members match your search' : 'No members yet'}
          </p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member._id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                  <td className="px-4 py-3 text-gray-600">{member.phone}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEdit(member)}
                        className="rounded-lg border border-gray-200 p-2 text-primary hover:border-primary hover:bg-primary/5"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(member)}
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
        title="Delete member?"
        message={
          deleteTarget
            ? `Delete “${deleteTarget.name}”? This will also remove related ground rent records.`
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
