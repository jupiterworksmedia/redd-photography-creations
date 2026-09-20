'use client';

import React, { useState, useEffect } from 'react';
import { CategoryItem, PhotoItem } from '@/lib/types';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tags,
  Layers,
  Power,
  Check,
  X,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const initialFormState = {
    label: '',
    slug: '',
    description: '',
    enabled: true,
    order: 10,
  };
  const [formState, setFormState] = useState(initialFormState);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, photosRes] = await Promise.all([
        fetch('/api/categories?all=true'),
        fetch('/api/gallery'),
      ]);
      const catsData = await catsRes.json();
      const photosData = await photosRes.json();

      if (catsData.categories) setCategories(catsData.categories);
      if (photosData.photos) setPhotos(photosData.photos);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentEditId(null);
    setFormState({
      ...initialFormState,
      order: (categories.length + 1) * 10,
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setIsEditing(true);
    setCurrentEditId(cat.id);
    setFormState({
      label: cat.label,
      slug: cat.slug,
      description: cat.description || '',
      enabled: cat.enabled,
      order: cat.order || 1,
    });
    setModalOpen(true);
  };

  const handleToggleEnabled = async (cat: CategoryItem) => {
    try {
      const newEnabled = !cat.enabled;
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newEnabled }),
      });

      if (res.ok) {
        setCategories(
          categories.map((c) => (c.id === cat.id ? { ...c, enabled: newEnabled } : c))
        );
        showNotification('success', `Category "${cat.label}" is now ${newEnabled ? 'ENABLED' : 'DISABLED'}.`);
      } else {
        const data = await res.json();
        showNotification('error', data.error || 'Failed to toggle category.');
      }
    } catch (err) {
      console.error('Toggle error:', err);
      showNotification('error', 'Network error toggling status.');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditing && currentEditId) {
        const res = await fetch(`/api/categories/${currentEditId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formState),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update category');
        showNotification('success', `Category "${formState.label}" updated successfully.`);
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formState),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create category');
        showNotification('success', `New category "${formState.label}" added successfully.`);
      }

      setModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        showNotification('error', err.message);
      } else {
        showNotification('error', 'An error occurred while saving.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem) => {
    const assignedPhotos = photos.filter((p) => p.category.toLowerCase() === cat.slug.toLowerCase()).length;
    if (assignedPhotos > 0) {
      alert(`Cannot delete "${cat.label}" because ${assignedPhotos} photo(s) are assigned to it. Please toggle it to "Disabled" instead.`);
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete category "${cat.label}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== cat.id));
        showNotification('success', `Category "${cat.label}" deleted.`);
      } else {
        showNotification('error', data.error || 'Failed to delete category.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showNotification('error', 'Error deleting category.');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const enabledCount = categories.filter((c) => c.enabled).length;
  const disabledCount = categories.filter((c) => !c.enabled).length;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-red-500 font-semibold block mb-1">
            Taxonomy & Disciplines
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Categories & Options Manager
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Create new disciplines and enable or disable visibility across the public website and booking forms.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Notification banner */}
      {notification && (
        <div
          className={`p-4 rounded text-xs flex items-center space-x-3 animate-in fade-in duration-300 ${
            notification.type === 'success'
              ? 'bg-green-950/40 border border-green-800/60 text-green-300'
              : 'bg-red-950/40 border border-red-800/60 text-red-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 bg-[#0e0e14] border border-white/5 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase tracking-wider">Total Defined Disciplines</span>
            <Tags className="w-4 h-4 text-red-500" />
          </div>
          <p className="font-editorial text-3xl font-bold text-white">{categories.length}</p>
        </div>

        <div className="p-5 bg-[#0e0e14] border border-white/5 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase tracking-wider">Active & Visible Options</span>
            <Power className="w-4 h-4 text-green-500" />
          </div>
          <p className="font-editorial text-3xl font-bold text-green-400">{enabledCount}</p>
          <span className="text-[10px] text-neutral-500">Visible on homepage & booking form</span>
        </div>

        <div className="p-5 bg-[#0e0e14] border border-white/5 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase tracking-wider">Disabled / Hidden Options</span>
            <Power className="w-4 h-4 text-neutral-500" />
          </div>
          <p className="font-editorial text-3xl font-bold text-neutral-400">{disabledCount}</p>
          <span className="text-[10px] text-neutral-500">Hidden from visitors, photos preserved</span>
        </div>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
          <p className="text-xs uppercase tracking-widest text-neutral-400">Loading Categories...</p>
        </div>
      ) : (
        <div className="bg-[#0e0e14] border border-white/5 rounded-sm overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-neutral-300 text-xs font-semibold uppercase tracking-wider">
              <Layers className="w-4 h-4 text-red-500" />
              <span>Configured Portfolio Categories</span>
            </div>
            <span className="text-[11px] text-neutral-500">
              Click toggle switch to instantly enable or disable an option
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {categories.map((cat) => {
              const photoCount = photos.filter(
                (p) => p.category.toLowerCase() === cat.slug.toLowerCase()
              ).length;

              return (
                <div
                  key={cat.id}
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    cat.enabled ? 'hover:bg-white/[0.02]' : 'bg-neutral-950/40 opacity-75'
                  }`}
                >
                  {/* Category Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono text-neutral-500 w-8">
                        #{cat.order}
                      </span>
                      <h3 className="font-editorial text-2xl font-bold text-white">
                        {cat.label}
                      </h3>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                        slug: {cat.slug}
                      </span>
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold border ${
                          cat.enabled
                            ? 'bg-green-950/60 border-green-700/50 text-green-400'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                        }`}
                      >
                        {cat.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    {cat.description && (
                      <p className="text-xs text-neutral-400 pl-11 font-light leading-relaxed">
                        {cat.description}
                      </p>
                    )}

                    <div className="pl-11 text-[11px] text-neutral-500 flex items-center space-x-4 pt-0.5">
                      <span>Assigned Works: <strong className="text-neutral-300">{photoCount} photos</strong></span>
                    </div>
                  </div>

                  {/* Actions & Enable/Disable Toggle */}
                  <div className="flex items-center space-x-4 pl-11 md:pl-0 shrink-0">
                    {/* Enable / Disable Button */}
                    <button
                      onClick={() => handleToggleEnabled(cat)}
                      className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                        cat.enabled
                          ? 'bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-600/40'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                      }`}
                      title={cat.enabled ? 'Click to Disable' : 'Click to Enable'}
                    >
                      <Power className={`w-3.5 h-3.5 ${cat.enabled ? 'text-green-400' : 'text-neutral-500'}`} />
                      <span>{cat.enabled ? 'Enabled (Active)' : 'Disabled (Hidden)'}</span>
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-2 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      disabled={photoCount > 0}
                      className="p-2 text-neutral-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-neutral-500 bg-white/5 hover:bg-white/10 rounded transition-colors"
                      title={photoCount > 0 ? 'Cannot delete category with photos attached' : 'Delete Category'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Dialog: Add / Edit Category */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0e0e14] border border-white/10 rounded-sm max-w-lg w-full p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-red-500 font-semibold block">
                  {isEditing ? 'Modify Category' : 'New Discipline'}
                </span>
                <h2 className="font-editorial text-2xl font-bold text-white">
                  {isEditing ? 'Edit Category Option' : 'Create / Add Category'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              {/* Category Label */}
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                  Category Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formState.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    const autoSlug = isEditing
                      ? formState.slug
                      : label.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
                    setFormState({ ...formState, label, slug: autoSlug });
                  }}
                  placeholder="e.g. Architectural & Interiors"
                  className="w-full bg-[#14141b] border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Slug Identifier */}
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                  Identifier / Slug (lowercase URL key) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formState.slug}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
                    })
                  }
                  placeholder="e.g. architectural"
                  className="w-full bg-[#14141b] border border-white/10 px-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-red-600"
                />
                <span className="text-[10px] text-neutral-500 block">
                  Used internally and in gallery URLs (e.g. #architectural)
                </span>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                  Discipline Narrative / Subtitle
                </label>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Summary of this photographic focus, aesthetic, and production style..."
                  className="w-full bg-[#14141b] border border-white/10 p-3 text-white focus:outline-none focus:border-red-600 resize-none leading-relaxed"
                />
              </div>

              {/* Order & Enabled Switch */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formState.order}
                    onChange={(e) =>
                      setFormState({ ...formState, order: parseInt(e.target.value) || 10 })
                    }
                    className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center space-x-2.5 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={formState.enabled}
                      onChange={(e) => setFormState({ ...formState, enabled: e.target.checked })}
                      className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-[#14141b] border-white/20"
                    />
                    <span className="text-white font-medium">Enable Category Option</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-white/10 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 uppercase tracking-wider text-xs rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold uppercase tracking-wider text-xs rounded flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isEditing ? 'Save Changes' : 'Create Category'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
