import { useCallback, useEffect, useState } from 'react';
import api from '../../api/client';
import ConfirmModal from '../../components/ConfirmModal';
import { DeleteIcon, EditIcon } from '../../components/ActionIcons';

function formatAmount(n) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

export default function Finance() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [entries, setEntries] = useState([]);
  const [overview, setOverview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('credit');
  const [amount, setAmount] = useState('');
  const [editingEntryId, setEditingEntryId] = useState(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sort, setSort] = useState('title');

  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteEntry, setDeleteEntry] = useState(null);
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    const res = await api.get('/admin/finance/categories');
    const list = res.data.categories || [];
    setCategories(list);
    return list;
  }, []);

  const loadOverview = useCallback(async (id) => {
    if (!id) {
      setOverview(null);
      return;
    }
    const res = await api.get('/admin/finance/overview', {
      params: { categoryId: id },
    });
    setOverview(res.data);
  }, []);

  const loadEntries = useCallback(async () => {
    if (!categoryId) {
      setEntries([]);
      return;
    }
    setListLoading(true);
    setError('');
    try {
      const params = { categoryId, sort };
      if (search.trim()) params.q = search.trim();
      if (typeFilter === 'credit' || typeFilter === 'debit') params.type = typeFilter;
      const res = await api.get('/admin/finance/entries', { params });
      setEntries(res.data.entries || []);
    } catch {
      setError('Failed to load entries');
    } finally {
      setListLoading(false);
    }
  }, [categoryId, search, typeFilter, sort]);

  useEffect(() => {
    loadCategories()
      .then((list) => {
        if (list.length && !categoryId) {
          setCategoryId(list[0]._id);
        }
      })
      .catch(() => setError('Failed to load categories'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadCategories]);

  useEffect(() => {
    if (!categoryId) {
      setOverview(null);
      setEntries([]);
      return;
    }
    loadOverview(categoryId).catch(() => {});
  }, [categoryId, loadOverview]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadEntries();
    }, 200);
    return () => clearTimeout(t);
  }, [loadEntries]);

  const resetEntryForm = () => {
    setTitle('');
    setDescription('');
    setType('credit');
    setAmount('');
    setEditingEntryId(null);
  };

  const resetCategoryForm = () => {
    setCategoryName('');
    setEditingCategoryId(null);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCategoryLoading(true);
    try {
      if (editingCategoryId) {
        const res = await api.put(`/admin/finance/categories/${editingCategoryId}`, {
          name: categoryName,
        });
        await loadCategories();
        if (categoryId === editingCategoryId) {
          setCategoryId(res.data.category._id);
        }
      } else {
        const res = await api.post('/admin/finance/categories', { name: categoryName });
        const list = await loadCategories();
        setCategoryId(res.data.category._id || list[list.length - 1]?._id || '');
      }
      resetCategoryForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save category');
    } finally {
      setCategoryLoading(false);
    }
  };

  const startEditCategory = () => {
    const current = categories.find((c) => c._id === categoryId);
    if (!current) return;
    setEditingCategoryId(current._id);
    setCategoryName(current.name);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategory) return;
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/admin/finance/categories/${deleteCategory._id}`);
      const list = await loadCategories();
      if (categoryId === deleteCategory._id) {
        setCategoryId(list[0]?._id || '');
        resetEntryForm();
      }
      if (editingCategoryId === deleteCategory._id) resetCategoryForm();
      setDeleteCategory(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete category');
      setDeleteCategory(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) return;
    setError('');
    setLoading(true);
    try {
      const payload = {
        categoryId,
        title,
        description,
        type,
        amount: Number(amount),
      };
      if (editingEntryId) {
        await api.put(`/admin/finance/entries/${editingEntryId}`, payload);
      } else {
        await api.post('/admin/finance/entries', payload);
      }
      resetEntryForm();
      await Promise.all([loadEntries(), loadOverview(categoryId)]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const startEditEntry = (entry) => {
    setEditingEntryId(entry._id);
    setTitle(entry.title);
    setDescription(entry.description || '');
    setType(entry.type);
    setAmount(String(entry.amount));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDeleteEntry = async () => {
    if (!deleteEntry) return;
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/admin/finance/entries/${deleteEntry._id}`);
      if (editingEntryId === deleteEntry._id) resetEntryForm();
      setDeleteEntry(null);
      await Promise.all([loadEntries(), loadOverview(categoryId)]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete entry');
      setDeleteEntry(null);
    } finally {
      setDeleting(false);
    }
  };

  const selectedCategory = categories.find((c) => c._id === categoryId);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-primary">Finance</h1>
      <p className="mt-1 text-sm text-gray-500">Manage credit and debit by category</p>

      <form
        onSubmit={handleCategorySubmit}
        className="mt-6 space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label className="mb-1 block text-sm text-gray-600">
              {editingCategoryId ? 'Edit category name' : 'New category'}
            </label>
            <input
              type="text"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Tournament 2026"
              className="w-full min-h-[44px] rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={categoryLoading}
              className="min-h-[44px] rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50"
            >
              {categoryLoading
                ? 'Saving...'
                : editingCategoryId
                  ? 'Update category'
                  : 'Add category'}
            </button>
            {editingCategoryId && (
              <button
                type="button"
                onClick={resetCategoryForm}
                className="min-h-[44px] rounded-lg border border-gray-200 px-4 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Active category</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                resetEntryForm();
              }}
              className="w-full min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!categoryId}
              onClick={startEditCategory}
              className="min-h-[44px] rounded-lg border border-gray-200 px-4 text-sm text-primary hover:border-primary disabled:opacity-50"
            >
              Edit category
            </button>
            <button
              type="button"
              disabled={!categoryId}
              onClick={() => setDeleteCategory(selectedCategory || null)}
              className="min-h-[44px] rounded-lg border border-red-200 px-4 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Delete category
            </button>
          </div>
        </div>
      </form>

      {categoryId && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total credit</p>
              <p className="mt-2 text-2xl font-bold text-primary">
                {overview ? formatAmount(overview.totalCredit) : '—'}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total debit</p>
              <p className="mt-2 text-2xl font-bold text-primary">
                {overview ? formatAmount(overview.totalDebit) : '—'}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Balance</p>
              <p className="mt-2 text-2xl font-bold text-primary">
                {overview ? formatAmount(overview.balance) : '—'}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleEntrySubmit}
            className="mt-6 space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <p className="text-sm font-medium text-gray-700">
              Entries for{' '}
              <span className="text-lg font-bold text-primary sm:text-xl">
                {selectedCategory?.name}
              </span>
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-gray-600">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title / Name"
                  className="w-full min-h-[44px] rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">Type</label>
                <select
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
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
                  placeholder="0"
                  className="w-full min-h-[44px] rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="mb-1 block text-sm text-gray-600">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about this entry"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={loading}
                className="min-h-[44px] rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingEntryId ? 'Update entry' : 'Add entry'}
              </button>
              {editingEntryId && (
                <button
                  type="button"
                  onClick={resetEntryForm}
                  className="min-h-[44px] rounded-lg border border-gray-200 px-4 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600">Search</label>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Title or description"
                className="w-full min-h-[44px] rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">Credit / Debit</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary"
              >
                <option value="">All</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">Sort by title</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary"
              >
                <option value="title">Title A–Z</option>
                <option value="title_desc">Title Z–A</option>
              </select>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            {listLoading ? (
              <p className="p-6 text-center text-sm text-gray-500">Loading entries...</p>
            ) : entries.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">
                {search.trim() ? 'No entries match your search' : 'No entries yet'}
              </p>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry._id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900">{entry.title}</td>
                      <td className="max-w-xs px-4 py-3 text-gray-600">
                        {entry.description ? (
                          <span className="line-clamp-2">{entry.description}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            entry.type === 'credit'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {entry.type === 'credit' ? 'Credit' : 'Debit'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{formatAmount(entry.amount)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEditEntry(entry)}
                            className="rounded-lg border border-gray-200 p-2 text-primary hover:border-primary hover:bg-primary/5"
                            aria-label="Edit"
                            title="Edit"
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteEntry(entry)}
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
        </>
      )}

      {!categoryId && categories.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">Create a category to start adding credit and debit entries.</p>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <ConfirmModal
        open={Boolean(deleteEntry)}
        title="Delete entry?"
        message={
          deleteEntry
            ? `Delete “${deleteEntry.title}” (${deleteEntry.type} ${formatAmount(deleteEntry.amount)})?`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDeleteEntry}
        onCancel={() => setDeleteEntry(null)}
        loading={deleting}
      />

      <ConfirmModal
        open={Boolean(deleteCategory)}
        title="Delete category?"
        message={
          deleteCategory
            ? `Delete “${deleteCategory.name}”? This will also remove all entries in this category.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDeleteCategory}
        onCancel={() => setDeleteCategory(null)}
        loading={deleting}
      />
    </div>
  );
}
