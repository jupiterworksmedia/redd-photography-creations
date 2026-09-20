'use client';

import React, { useState, useEffect } from 'react';
import { PhotoItem, CategoryType, CategoryItem } from '@/lib/types';
import {
  Plus,
  Trash2,
  Edit2,
  Star,
  Upload,
  Search,
  Check,
  X,
  Camera,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [dbCategories, setDbCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const initialFormState = {
    title: '',
    category: 'fashion' as CategoryType,
    imageUrl: '',
    aspectRatio: 'tall' as 'tall' | 'wide' | 'square',
    client: '',
    story: '',
    year: new Date().getFullYear().toString(),
    location: '',
    camera: 'Hasselblad H6D-100c',
    lens: 'HC 100mm f/2.2',
    aperture: 'f/2.8',
    shutterSpeed: '1/250s',
    iso: '100',
    featured: false,
    order: 1,
  };
  const [formState, setFormState] = useState(initialFormState);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [photosRes, catsRes] = await Promise.all([
        fetch('/api/gallery'),
        fetch('/api/categories?all=true'),
      ]);
      const photosData = await photosRes.json();
      const catsData = await catsRes.json();

      if (photosData.photos) {
        setPhotos(photosData.photos);
      }
      if (catsData.categories) {
        setDbCategories(catsData.categories);
        if (catsData.categories.length > 0 && !initialFormState.category) {
          initialFormState.category = catsData.categories[0].slug;
        }
      }
    } catch (err) {
      console.error('Error loading gallery data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = fetchData;

  useEffect(() => {
    fetchPhotos();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentEditId(null);
    setFormState(initialFormState);
    setModalOpen(true);
  };

  const openEditModal = (photo: PhotoItem) => {
    setIsEditing(true);
    setCurrentEditId(photo.id);
    setFormState({
      title: photo.title,
      category: photo.category,
      imageUrl: photo.imageUrl,
      aspectRatio: photo.aspectRatio || 'tall',
      client: photo.client || '',
      story: photo.story || '',
      year: photo.year || '',
      location: photo.location || '',
      camera: photo.camera || '',
      lens: photo.lens || '',
      aperture: photo.aperture || '',
      shutterSpeed: photo.shutterSpeed || '',
      iso: photo.iso || '',
      featured: photo.featured || false,
      order: photo.order || 1,
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const safeName = (file.name || 'photo.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
    const formData = new FormData();
    formData.append('file', file, safeName);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok && data.success && data.url) {
        setFormState((prev) => ({ ...prev, imageUrl: data.url }));
      } else {
        alert(data.error || `Upload failed (${res.status})`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading image. Please check file format.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditing && currentEditId) {
        const res = await fetch(`/api/gallery/${currentEditId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formState),
        });
        if (!res.ok) throw new Error('Failed to update photo');
      } else {
        const res = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formState),
        });
        if (!res.ok) throw new Error('Failed to create photo');
      }

      setModalOpen(false);
      await fetchPhotos();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('An unexpected error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePhoto = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPhotos(photos.filter((p) => p.id !== id));
      } else {
        alert('Failed to delete photo');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting photo');
    }
  };

  const handleToggleFeatured = async (photo: PhotoItem) => {
    try {
      const newFeatured = !photo.featured;
      const res = await fetch(`/api/gallery/${photo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: newFeatured }),
      });
      if (res.ok) {
        setPhotos(
          photos.map((p) => (p.id === photo.id ? { ...p, featured: newFeatured } : p))
        );
      }
    } catch (err) {
      console.error('Featured toggle error:', err);
    }
  };

  // Filtered list
  const filteredPhotos = photos.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.client && p.client.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const filterTabs = [
    { key: 'all', label: 'All Photos', enabled: true },
    ...dbCategories.map((c) => ({ key: c.slug, label: c.label, enabled: c.enabled })),
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-red-500 font-semibold block mb-1">
            Portfolio Management
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Curated Gallery Works
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Total active photographs: <span className="text-white font-semibold">{photos.length}</span>
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Work</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e0e14] p-4 rounded-sm border border-white/5">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((cat) => {
            const count =
              cat.key === 'all'
                ? photos.length
                : photos.filter((p) => p.category.toLowerCase() === cat.key.toLowerCase()).length;
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`text-xs uppercase tracking-wider px-3 py-1.5 rounded transition-colors flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                } ${!cat.enabled && cat.key !== 'all' ? 'opacity-60 border border-dashed border-neutral-700' : ''}`}
              >
                <span>{cat.label}</span>
                <span>({count})</span>
                {!cat.enabled && cat.key !== 'all' && (
                  <span className="text-[9px] text-amber-400 uppercase font-mono ml-1">Off</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, client..."
            className="w-full bg-[#14141b] border border-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-600"
          />
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
          <p className="text-xs uppercase tracking-widest text-neutral-400">Loading Portfolio Works...</p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/10 rounded">
          <p className="text-neutral-400 text-sm">No photographs found matching the current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="bg-[#0e0e14] border border-white/5 rounded-sm overflow-hidden flex flex-col justify-between group hover:border-white/20 transition-colors"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-black/80 backdrop-blur-md text-red-400 font-semibold border border-white/10 rounded">
                    {photo.category}
                  </span>
                  {photo.featured && (
                    <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-red-600 text-white font-semibold rounded">
                      Featured
                    </span>
                  )}
                </div>

                {/* Quick actions overlay */}
                <div className="absolute top-3 right-3 flex items-center space-x-1.5">
                  <button
                    onClick={() => handleToggleFeatured(photo)}
                    className={`p-1.5 rounded bg-black/70 backdrop-blur border border-white/10 ${
                      photo.featured ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Toggle Homepage Feature"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <a
                    href={photo.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded bg-black/70 backdrop-blur border border-white/10 text-neutral-400 hover:text-white"
                    title="View Source Image"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Photo Information */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-editorial text-xl font-bold text-white leading-tight">
                    {photo.title}
                  </h3>
                  {photo.client && (
                    <p className="text-xs text-neutral-400 truncate">{photo.client}</p>
                  )}
                  {photo.camera && (
                    <p className="text-[11px] text-neutral-500 font-mono pt-1">
                      {photo.camera} • {photo.lens}
                    </p>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-neutral-500">
                    Order: {photo.order} • {photo.aspectRatio}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(photo)}
                      className="p-1.5 text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
                      title="Edit Photograph"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id, photo.title)}
                      className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/50 rounded transition-colors"
                      title="Delete Photograph"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog: Add / Edit Photograph */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#0e0e14] border border-white/10 rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-red-500 font-semibold block">
                  {isEditing ? 'Modify Existing Entry' : 'New Portfolio Entry'}
                </span>
                <h2 className="font-editorial text-2xl font-bold text-white">
                  {isEditing ? 'Edit Photograph' : 'Upload & Publish Photograph'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="space-y-4 text-xs">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    placeholder="e.g. Monolith in Obsidian"
                    className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                    Discipline / Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) =>
                      setFormState({ ...formState, category: e.target.value as CategoryType })
                    }
                    className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-red-600"
                  >
                    {dbCategories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.label} {!cat.enabled ? '(Disabled)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image URL & File Upload */}
              <div className="space-y-2">
                <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                  Image Source <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formState.imageUrl}
                    onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/... or upload local file below"
                    className="flex-1 bg-[#14141b] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-red-600 font-mono text-[11px]"
                  />
                  <label className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded cursor-pointer transition-colors shrink-0">
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {formState.imageUrl && (
                  <div className="mt-2 relative w-32 h-24 bg-neutral-900 border border-white/10 rounded overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formState.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Aspect Ratio, Client & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                    Aspect Ratio
                  </label>
                  <select
                    value={formState.aspectRatio}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        aspectRatio: e.target.value as 'tall' | 'wide' | 'square',
                      })
                    }
                    className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="tall">Tall (Portrait 3:4)</option>
                    <option value="wide">Wide (Landscape 16:10)</option>
                    <option value="square">Square (1:1)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                    Client / Publication
                  </label>
                  <input
                    type="text"
                    value={formState.client}
                    onChange={(e) => setFormState({ ...formState, client: e.target.value })}
                    placeholder="e.g. Vogue Scandinavia"
                    className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formState.location}
                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                    placeholder="e.g. Copenhagen, Denmark"
                    className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Story / Concept description */}
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                  Shoot Narrative / Story
                </label>
                <textarea
                  rows={2}
                  value={formState.story}
                  onChange={(e) => setFormState({ ...formState, story: e.target.value })}
                  placeholder="Artistic context, lighting approach, creative intent..."
                  className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              {/* EXIF Technical Details */}
              <div className="p-3 bg-black/40 border border-white/5 rounded space-y-3">
                <div className="flex items-center space-x-2 text-neutral-300 font-semibold">
                  <Camera className="w-3.5 h-3.5 text-red-500" />
                  <span className="uppercase tracking-wider text-[11px]">
                    Technical Camera Specifications (EXIF)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Camera Body</span>
                    <input
                      type="text"
                      value={formState.camera}
                      onChange={(e) => setFormState({ ...formState, camera: e.target.value })}
                      placeholder="e.g. Hasselblad H6D"
                      className="w-full bg-[#14141b] border border-white/10 p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Lens</span>
                    <input
                      type="text"
                      value={formState.lens}
                      onChange={(e) => setFormState({ ...formState, lens: e.target.value })}
                      placeholder="e.g. HC 100mm f/2.2"
                      className="w-full bg-[#14141b] border border-white/10 p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Aperture</span>
                    <input
                      type="text"
                      value={formState.aperture}
                      onChange={(e) => setFormState({ ...formState, aperture: e.target.value })}
                      placeholder="e.g. f/2.8"
                      className="w-full bg-[#14141b] border border-white/10 p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Shutter</span>
                    <input
                      type="text"
                      value={formState.shutterSpeed}
                      onChange={(e) => setFormState({ ...formState, shutterSpeed: e.target.value })}
                      placeholder="e.g. 1/250s"
                      className="w-full bg-[#14141b] border border-white/10 p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block">ISO</span>
                    <input
                      type="text"
                      value={formState.iso}
                      onChange={(e) => setFormState({ ...formState, iso: e.target.value })}
                      placeholder="e.g. 64"
                      className="w-full bg-[#14141b] border border-white/10 p-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Featured Toggle & Sort Order */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.featured}
                    onChange={(e) => setFormState({ ...formState, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-0 focus:ring-offset-0 bg-[#14141b] border-white/20"
                  />
                  <span className="text-white font-medium">Highlight on Homepage as Featured</span>
                </label>

                <div className="flex items-center space-x-2">
                  <span className="text-neutral-400">Order Priority:</span>
                  <input
                    type="number"
                    value={formState.order}
                    onChange={(e) =>
                      setFormState({ ...formState, order: parseInt(e.target.value) || 1 })
                    }
                    className="w-16 bg-[#14141b] border border-white/10 px-2 py-1 text-white text-center"
                  />
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
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold uppercase tracking-wider text-xs rounded flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isEditing ? 'Save Changes' : 'Publish Photograph'}</span>
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
