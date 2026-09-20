'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HeroSlideItem, CategoryItem } from '@/lib/types';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Power,
  Check,
  X,
  Upload,
  Link as LinkIcon,
  SlidersHorizontal,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Eye,
} from 'lucide-react';

export default function AdminSliderPage() {
  const [slides, setSlides] = useState<HeroSlideItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State
  const initialFormState: {
    title: string;
    subtitle: string;
    tagline: string;
    description: string;
    imageUrl: string;
    category: string;
    buttonText: string;
    buttonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    textAlignment: 'left' | 'center' | 'right';
    fontStyle: 'editorial-serif' | 'modern-sans';
    titleCase: 'uppercase' | 'titlecase';
    accentColor: 'crimson' | 'red' | 'white' | 'gold';
    overlayOpacity: number;
    order: number;
    enabled: boolean;
  } = {
    title: '',
    subtitle: '',
    tagline: '',
    description: '',
    imageUrl: '',
    category: 'fashion',
    buttonText: 'Explore Series',
    buttonLink: '#work',
    secondaryButtonText: 'Initiate Booking',
    secondaryButtonLink: '/contact',
    textAlignment: 'left',
    fontStyle: 'editorial-serif',
    titleCase: 'uppercase',
    accentColor: 'crimson',
    overlayOpacity: 0.55,
    order: 1,
    enabled: true,
  };

  const [formState, setFormState] = useState(initialFormState);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [slidesRes, catsRes] = await Promise.all([
        fetch('/api/slides?all=true'),
        fetch('/api/categories?all=true'),
      ]);
      const slidesData = await slidesRes.json();
      const catsData = await catsRes.json();

      if (slidesData.slides) setSlides(slidesData.slides);
      if (catsData.categories) setCategories(catsData.categories);
    } catch (err) {
      console.error('Error fetching slides:', err);
      showNotification('error', 'Failed to load slider data.');
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
      order: (slides.length + 1),
    });
    setModalOpen(true);
  };

  const openEditModal = (slide: HeroSlideItem) => {
    setIsEditing(true);
    setCurrentEditId(slide.id);
    setFormState({
      title: slide.title,
      subtitle: slide.subtitle || '',
      tagline: slide.tagline || '',
      description: slide.description || '',
      imageUrl: slide.imageUrl,
      category: slide.category || 'fashion',
      buttonText: slide.buttonText || 'Explore Series',
      buttonLink: slide.buttonLink || '#work',
      secondaryButtonText: slide.secondaryButtonText || '',
      secondaryButtonLink: slide.secondaryButtonLink || '',
      textAlignment: slide.textAlignment || 'left',
      fontStyle: slide.fontStyle || 'editorial-serif',
      titleCase: slide.titleCase || 'uppercase',
      accentColor: slide.accentColor || 'crimson',
      overlayOpacity: slide.overlayOpacity ?? 0.55,
      order: slide.order || 1,
      enabled: slide.enabled,
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const safeName = (file.name || 'slide.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
      const formData = new FormData();
      formData.append('file', file, safeName);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const responseText = await res.text();
      const data = responseText ? JSON.parse(responseText) : {};
      if (!res.ok) throw new Error(data.error || `Upload failed with status ${res.status}`);

      setFormState((prev) => ({
        ...prev,
        imageUrl: data.url,
      }));
      showNotification('success', 'Image uploaded successfully!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        showNotification('error', err.message);
      } else {
        showNotification('error', 'Failed to upload image');
      }
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleToggleEnabled = async (slide: HeroSlideItem) => {
    try {
      const newEnabled = !slide.enabled;
      const res = await fetch(`/api/slides/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newEnabled }),
      });

      if (res.ok) {
        setSlides(
          slides.map((s) => (s.id === slide.id ? { ...s, enabled: newEnabled } : s))
        );
        showNotification('success', `Slide "${slide.title}" is now ${newEnabled ? 'ENABLED' : 'DISABLED'}.`);
      } else {
        const data = await res.json();
        showNotification('error', data.error || 'Failed to toggle slide status.');
      }
    } catch (err) {
      console.error('Toggle error:', err);
      showNotification('error', 'Network error toggling status.');
    }
  };

  const handleReorder = async (slide: HeroSlideItem, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex((s) => s.id === slide.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const targetSlide = slides[targetIndex];
    const currentOrder = slide.order;
    const targetOrder = targetSlide.order;

    try {
      await Promise.all([
        fetch(`/api/slides/${slide.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: targetOrder }),
        }),
        fetch(`/api/slides/${targetSlide.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: currentOrder }),
        }),
      ]);

      await fetchData();
      showNotification('success', 'Slide sequence updated.');
    } catch (err) {
      console.error('Reorder error:', err);
      showNotification('error', 'Failed to update slide sequence.');
    }
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.imageUrl) {
      showNotification('error', 'Please provide an image URL or upload a file.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && currentEditId) {
        const res = await fetch(`/api/slides/${currentEditId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formState),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update slide');
        showNotification('success', `Slide "${formState.title}" updated successfully.`);
      } else {
        const res = await fetch('/api/slides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formState),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create slide');
        showNotification('success', `New slide "${formState.title}" added successfully.`);
      }

      try {
        window.dispatchEvent(new Event('redd_settings_updated'));
      } catch {}

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

  const handleDeleteSlide = async (slide: HeroSlideItem) => {
    if (!confirm(`Are you sure you want to permanently delete slide "${slide.title}"?`)) return;

    try {
      const res = await fetch(`/api/slides/${slide.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSlides(slides.filter((s) => s.id !== slide.id));
        showNotification('success', `Slide "${slide.title}" deleted.`);
      } else {
        showNotification('error', data.error || 'Failed to delete slide.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showNotification('error', 'Error deleting slide.');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const enabledCount = slides.filter((s) => s.enabled).length;
  const disabledCount = slides.filter((s) => !s.enabled).length;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-red-500 font-semibold block mb-1">
            Visual Storytelling
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Hero Slider Manager
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Curate the dynamic hero carousel slides, upload high-res imagery, format typography, and toggle live visibility.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slide</span>
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
            <span className="text-[11px] uppercase tracking-wider">Total Configured Slides</span>
            <SlidersHorizontal className="w-4 h-4 text-red-500" />
          </div>
          <p className="font-editorial text-3xl font-bold text-white">{slides.length}</p>
        </div>

        <div className="p-5 bg-[#0e0e14] border border-white/5 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase tracking-wider">Active in Hero Carousel</span>
            <Power className="w-4 h-4 text-green-500" />
          </div>
          <p className="font-editorial text-3xl font-bold text-green-400">{enabledCount}</p>
          <span className="text-[10px] text-neutral-500">Currently cycling on the homepage</span>
        </div>

        <div className="p-5 bg-[#0e0e14] border border-white/5 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase tracking-wider">Disabled / Hidden Slides</span>
            <Power className="w-4 h-4 text-neutral-500" />
          </div>
          <p className="font-editorial text-3xl font-bold text-neutral-400">{disabledCount}</p>
          <span className="text-[10px] text-neutral-500">Stored in database but hidden from visitors</span>
        </div>
      </div>

      {/* Slides Cards List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
          <p className="text-xs uppercase tracking-widest text-neutral-400">Loading Slides...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, index) => {
            const alignClass =
              slide.textAlignment === 'center'
                ? 'text-center items-center'
                : slide.textAlignment === 'right'
                ? 'text-right items-end'
                : 'text-left items-start';

            const accentColorMap: Record<string, string> = {
              crimson: 'text-red-500 border-red-500',
              red: 'text-red-500 border-red-500',
              white: 'text-white border-white',
              gold: 'text-amber-400 border-amber-400',
            };

            const accentBadgeClass = accentColorMap[slide.accentColor] || 'text-red-500 border-red-500';

            return (
              <div
                key={slide.id}
                className={`bg-[#0e0e14] border rounded-sm overflow-hidden transition-all duration-300 ${
                  slide.enabled ? 'border-white/10 hover:border-white/20' : 'border-white/5 opacity-70 bg-neutral-950/60'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-6 items-center">
                  {/* Left: Thumbnail & Visual Preview */}
                  <div className="lg:col-span-4 relative rounded overflow-hidden aspect-[16/10] bg-black border border-white/10 group">
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Simulated Dark Overlay */}
                    <div
                      className="absolute inset-0 bg-black transition-opacity"
                      style={{ opacity: slide.overlayOpacity ?? 0.55 }}
                    />

                    {/* Overlay preview label */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-end pointer-events-none">
                      <span className="text-[9px] uppercase tracking-widest text-red-400 font-mono">
                        {slide.tagline || slide.category}
                      </span>
                      <h4
                        className={`text-white text-base font-bold leading-tight drop-shadow-md ${
                          slide.fontStyle === 'modern-sans' ? 'font-sans' : 'font-editorial'
                        } ${slide.titleCase === 'uppercase' ? 'uppercase' : ''}`}
                      >
                        {slide.title}
                      </h4>
                    </div>

                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-neutral-300 border border-white/10">
                      #{slide.order}
                    </div>

                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-neutral-300 border border-white/10">
                      Dim: {Math.round((slide.overlayOpacity ?? 0.55) * 100)}%
                    </div>
                  </div>

                  {/* Middle: Details & Styling Badges */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                        {slide.category}
                      </span>
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold border ${
                          slide.enabled
                            ? 'bg-green-950/60 border-green-700/50 text-green-400'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                        }`}
                      >
                        {slide.enabled ? 'Live in Carousel' : 'Disabled'}
                      </span>
                      <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10">
                        {slide.fontStyle === 'modern-sans' ? 'Modern Sans' : 'Editorial Serif'}
                      </span>
                      <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10">
                        Align: {slide.textAlignment}
                      </span>
                      <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 border ${accentBadgeClass}`}>
                        Accent: {slide.accentColor}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-editorial text-2xl font-bold text-white">
                        {slide.title}
                      </h3>
                      {slide.subtitle && (
                        <p className="text-xs text-neutral-400 font-light mt-0.5">
                          {slide.subtitle}
                        </p>
                      )}
                    </div>

                    {slide.description && (
                      <p className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed">
                        {slide.description}
                      </p>
                    )}

                    <div className="text-[11px] text-neutral-500 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 border-t border-white/5">
                      <span>CTA: <strong className="text-neutral-300">{slide.buttonText || 'Explore'}</strong> &rarr; <span className="font-mono text-neutral-400">{slide.buttonLink}</span></span>
                      {slide.secondaryButtonText && (
                        <span>Sec: <strong className="text-neutral-300">{slide.secondaryButtonText}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2">
                    {/* Enable / Disable Button */}
                    <button
                      onClick={() => handleToggleEnabled(slide)}
                      className={`inline-flex items-center justify-center space-x-2 px-3 py-2 rounded text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                        slide.enabled
                          ? 'bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-600/40'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                      }`}
                      title={slide.enabled ? 'Click to Disable' : 'Click to Enable'}
                    >
                      <Power className={`w-3.5 h-3.5 ${slide.enabled ? 'text-green-400' : 'text-neutral-500'}`} />
                      <span>{slide.enabled ? 'Enabled' : 'Disabled'}</span>
                    </button>

                    {/* Move Up / Down */}
                    <div className="flex items-center space-x-1 justify-end">
                      <button
                        onClick={() => handleReorder(slide, 'up')}
                        disabled={index === 0}
                        className="p-2 text-neutral-400 hover:text-white disabled:opacity-20 disabled:hover:text-neutral-400 bg-white/5 hover:bg-white/10 rounded transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleReorder(slide, 'down')}
                        disabled={index === slides.length - 1}
                        className="p-2 text-neutral-400 hover:text-white disabled:opacity-20 disabled:hover:text-neutral-400 bg-white/5 hover:bg-white/10 rounded transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => openEditModal(slide)}
                        className="p-2 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
                        title="Edit Slide Formatting & Media"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteSlide(slide)}
                        className="p-2 text-neutral-500 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded transition-colors"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog: Add / Edit Slide */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#0e0e14] border border-white/10 rounded-sm max-w-4xl w-full p-6 md:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-red-500 font-semibold block">
                  {isEditing ? 'Modify Slide' : 'New Presentation Slide'}
                </span>
                <h2 className="font-editorial text-2xl font-bold text-white">
                  {isEditing ? 'Edit Hero Slide & Typography' : 'Create / Add Hero Slide'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-6 text-xs">
              {/* Image Upload & Source Section */}
              <div className="p-4 bg-[#14141b] border border-white/10 rounded space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-neutral-300 flex items-center space-x-2">
                    <Upload className="w-3.5 h-3.5 text-red-500" />
                    <span>Hero Slide Photograph (Upload or URL)</span>
                  </span>
                  {uploadingImage && (
                    <span className="text-xs text-red-400 flex items-center space-x-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Local File Upload Button */}
                  <div className="md:col-span-5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      id="slide-file-upload"
                    />
                    <label
                      htmlFor="slide-file-upload"
                      className="flex flex-col items-center justify-center p-4 border border-dashed border-white/20 hover:border-red-500 rounded bg-black/30 hover:bg-white/[0.02] cursor-pointer transition-colors text-center group"
                    >
                      <Upload className="w-5 h-5 text-neutral-400 group-hover:text-red-500 mb-2 transition-colors" />
                      <span className="text-[11px] text-white font-medium">Upload Image File</span>
                      <span className="text-[9px] text-neutral-500 mt-0.5">JPEG, PNG, WEBP, AVIF (Max 10MB)</span>
                    </label>
                  </div>

                  <div className="md:col-span-1 text-center text-neutral-500 text-[10px] uppercase font-mono">
                    OR
                  </div>

                  {/* Direct URL Input */}
                  <div className="md:col-span-6 space-y-1.5">
                    <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                      Direct Image URL
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <LinkIcon className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={formState.imageUrl}
                          onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/... or /uploads/..."
                          className="w-full bg-black/40 border border-white/10 pl-9 pr-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thumbnail Preview if URL is present */}
                {formState.imageUrl && (
                  <div className="relative aspect-[21/9] rounded overflow-hidden border border-white/10 bg-black">
                    <img
                      src={formState.imageUrl}
                      alt="Slide preview"
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 bg-black pointer-events-none"
                      style={{ opacity: formState.overlayOpacity }}
                    />
                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] text-white">
                      Live Preview ({Math.round(formState.overlayOpacity * 100)}% Dim)
                    </div>
                  </div>
                )}
              </div>

              {/* Text Content Section */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-300 pb-1 border-b border-white/5">
                  Editorial Text & Content
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                      Slide Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.title}
                      onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                      placeholder="e.g. Monolith in Obsidian"
                      className="w-full bg-[#14141b] border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                      Subtitle / Publication Credit
                    </label>
                    <input
                      type="text"
                      value={formState.subtitle}
                      onChange={(e) => setFormState({ ...formState, subtitle: e.target.value })}
                      placeholder="e.g. Vogue Scandinavia • Autumn Issue"
                      className="w-full bg-[#14141b] border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  {/* Tagline / Category Eyebrow */}
                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                      Tagline / Eyebrow Header
                    </label>
                    <input
                      type="text"
                      value={formState.tagline}
                      onChange={(e) => setFormState({ ...formState, tagline: e.target.value })}
                      placeholder="e.g. Haute Couture & Movement"
                      className="w-full bg-[#14141b] border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  {/* Category dropdown */}
                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                      Discipline Category
                    </label>
                    <select
                      value={formState.category}
                      onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                      className="w-full bg-[#14141b] border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-red-600"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.label} ({c.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Narrative / Description */}
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                    Story / Editorial Narrative
                  </label>
                  <textarea
                    rows={2}
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    placeholder="Short description of the shoot, architectural backdrop, or creative direction..."
                    className="w-full bg-[#14141b] border border-white/10 p-3 text-white focus:outline-none focus:border-red-600 resize-none"
                  />
                </div>
              </div>

              {/* Text Formatting & Styling Controls */}
              <div className="p-4 bg-[#14141b] border border-white/10 rounded space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-300 pb-1 border-b border-white/5 flex items-center space-x-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-red-500" />
                  <span>Text Formatting & Visual Styling</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Text Alignment */}
                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                      Text Alignment
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 border border-white/10 rounded">
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, textAlignment: 'left' })}
                        className={`p-2 flex items-center justify-center rounded transition-colors ${
                          formState.textAlignment === 'left'
                            ? 'bg-red-600 text-white font-bold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                        title="Align Left"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, textAlignment: 'center' })}
                        className={`p-2 flex items-center justify-center rounded transition-colors ${
                          formState.textAlignment === 'center'
                            ? 'bg-red-600 text-white font-bold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                        title="Align Center"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, textAlignment: 'right' })}
                        className={`p-2 flex items-center justify-center rounded transition-colors ${
                          formState.textAlignment === 'right'
                            ? 'bg-red-600 text-white font-bold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                        title="Align Right"
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Typography Font Style */}
                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                      Title Typography
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-black/40 p-1 border border-white/10 rounded">
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, fontStyle: 'editorial-serif' })}
                        className={`px-2 py-2 text-[10px] uppercase tracking-wider rounded font-editorial transition-colors ${
                          formState.fontStyle === 'editorial-serif'
                            ? 'bg-red-600 text-white font-bold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        Editorial Serif
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, fontStyle: 'modern-sans' })}
                        className={`px-2 py-2 text-[10px] uppercase tracking-wider rounded font-sans transition-colors ${
                          formState.fontStyle === 'modern-sans'
                            ? 'bg-red-600 text-white font-bold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        Modern Sans
                      </button>
                    </div>
                  </div>

                  {/* Title Casing */}
                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                      Title Casing
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-black/40 p-1 border border-white/10 rounded">
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, titleCase: 'uppercase' })}
                        className={`px-2 py-2 text-[10px] uppercase tracking-wider rounded transition-colors ${
                          formState.titleCase === 'uppercase'
                            ? 'bg-red-600 text-white font-bold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        UPPERCASE
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, titleCase: 'titlecase' })}
                        className={`px-2 py-2 text-[10px] capitalize tracking-wider rounded transition-colors ${
                          formState.titleCase === 'titlecase'
                            ? 'bg-red-600 text-white font-bold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        Title Case
                      </button>
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                      Highlight Accent Color
                    </label>
                    <div className="grid grid-cols-4 gap-1 bg-black/40 p-1 border border-white/10 rounded">
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, accentColor: 'crimson' })}
                        className={`h-8 rounded flex items-center justify-center border transition-all ${
                          formState.accentColor === 'crimson' ? 'border-white ring-2 ring-red-600' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: '#dc2626' }}
                        title="Crimson Red"
                      />
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, accentColor: 'red' })}
                        className={`h-8 rounded flex items-center justify-center border transition-all ${
                          formState.accentColor === 'red' ? 'border-white ring-2 ring-red-500' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: '#ef4444' }}
                        title="Vivid Red"
                      />
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, accentColor: 'gold' })}
                        className={`h-8 rounded flex items-center justify-center border transition-all ${
                          formState.accentColor === 'gold' ? 'border-white ring-2 ring-amber-400' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: '#f59e0b' }}
                        title="Warm Tuscan Gold"
                      />
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, accentColor: 'white' })}
                        className={`h-8 rounded flex items-center justify-center border transition-all ${
                          formState.accentColor === 'white' ? 'border-black ring-2 ring-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: '#ffffff' }}
                        title="Pure Minimal White"
                      />
                    </div>
                  </div>
                </div>

                {/* Overlay Opacity Dimmer Slider */}
                <div className="pt-2 space-y-1.5">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="uppercase tracking-wider font-medium">
                      Background Overlay Darkness (Dimming for Text Legibility)
                    </span>
                    <span className="font-mono text-white text-xs font-bold">
                      {Math.round(formState.overlayOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.85"
                    step="0.05"
                    value={formState.overlayOpacity}
                    onChange={(e) => setFormState({ ...formState, overlayOpacity: parseFloat(e.target.value) })}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>10% (Lighter / Photo Vivid)</span>
                    <span>50% (Recommended Balanced)</span>
                    <span>85% (Darker / Maximum Text Contrast)</span>
                  </div>
                </div>
              </div>

              {/* Call to Action Buttons */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-300 pb-1 border-b border-white/5">
                  Call to Action (CTA) Buttons
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                      Primary Button Label
                    </label>
                    <input
                      type="text"
                      value={formState.buttonText}
                      onChange={(e) => setFormState({ ...formState, buttonText: e.target.value })}
                      placeholder="e.g. Explore Editorial"
                      className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                      Primary Button Link
                    </label>
                    <input
                      type="text"
                      value={formState.buttonLink}
                      onChange={(e) => setFormState({ ...formState, buttonLink: e.target.value })}
                      placeholder="e.g. #work or /services"
                      className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                      Secondary Button Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={formState.secondaryButtonText}
                      onChange={(e) => setFormState({ ...formState, secondaryButtonText: e.target.value })}
                      placeholder="e.g. Initiate Booking"
                      className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                      Secondary Button Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={formState.secondaryButtonLink}
                      onChange={(e) => setFormState({ ...formState, secondaryButtonLink: e.target.value })}
                      placeholder="e.g. /contact"
                      className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Order & Enabled Switch */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                    Slide Display Order
                  </label>
                  <input
                    type="number"
                    value={formState.order}
                    onChange={(e) =>
                      setFormState({ ...formState, order: parseInt(e.target.value) || 1 })
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
                    <span className="text-white font-medium">Enable in Hero Carousel</span>
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
                  disabled={submitting || uploadingImage}
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
                      <span>{isEditing ? 'Save Changes' : 'Create Slide'}</span>
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
