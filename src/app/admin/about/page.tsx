'use client';

import React, { useState, useEffect } from 'react';
import { AboutPageSettings, MilestoneItem, HonorItem } from '@/lib/types';
import {
  Save,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Camera,
  Award,
  BookOpen,
  User,
} from 'lucide-react';

export default function AdminAboutPage() {
  const [about, setAbout] = useState<AboutPageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetch('/api/about')
      .then((res) => res.json())
      .then((data) => {
        if (data.about) {
          setAbout(data.about);
        }
      })
      .catch((err) => {
        console.error('Error fetching about data:', err);
        setError('Failed to load About page settings');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!about) return;

    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      let res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: about }),
      });

      if (res.status === 405) {
        res = await fetch('/api/about', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: about }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save about settings');

      const savedData = data.about || about;
      try {
        localStorage.setItem('redd_about_data', JSON.stringify(savedData));
        window.dispatchEvent(
          new CustomEvent('redd_data_updated', { detail: { type: 'about', data: savedData } })
        );
      } catch {}

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !about) return;

    setUploadingImage(true);
    const safeName = (file.name || 'director_portrait.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
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
        setAbout((prev) => (prev ? { ...prev, portraitImageUrl: data.url } : null));
      } else {
        alert(data.error || `Upload failed (${res.status})`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Network error occurred during image upload');
    } finally {
      setUploadingImage(false);
    }
  };

  // Milestone handlers
  const handleMilestoneChange = (index: number, field: keyof MilestoneItem, value: string) => {
    if (!about) return;
    const next = [...about.milestones];
    next[index] = { ...next[index], [field]: value };
    setAbout({ ...about, milestones: next });
  };

  const addMilestone = () => {
    if (!about) return;
    const newItem: MilestoneItem = {
      id: `mile-${Date.now()}`,
      value: '10+',
      label: 'New Metric',
      order: about.milestones.length + 1,
    };
    setAbout({ ...about, milestones: [...about.milestones, newItem] });
  };

  const removeMilestone = (index: number) => {
    if (!about) return;
    const next = about.milestones.filter((_, i) => i !== index);
    setAbout({ ...about, milestones: next });
  };

  // Honors handlers
  const handleHonorChange = (index: number, field: keyof HonorItem, value: string) => {
    if (!about) return;
    const next = [...about.honorsList];
    next[index] = { ...next[index], [field]: value };
    setAbout({ ...about, honorsList: next });
  };

  const addHonor = () => {
    if (!about) return;
    const newItem: HonorItem = {
      id: `hon-${Date.now()}`,
      title: 'PUBLICATION / AWARD',
      subtitle: 'Category or Recognition Note',
      order: about.honorsList.length + 1,
    };
    setAbout({ ...about, honorsList: [...about.honorsList, newItem] });
  };

  const removeHonor = (index: number) => {
    if (!about) return;
    const next = about.honorsList.filter((_, i) => i !== index);
    setAbout({ ...about, honorsList: next });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!about) {
    return (
      <div className="p-8 text-center text-neutral-400">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p>Failed to load About page configuration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <User className="w-5 h-5 text-red-500" />
            <h1 className="font-editorial text-3xl text-white font-medium">About Page Editor</h1>
          </div>
          <p className="text-xs text-neutral-400">
            Control director biography, artist portrait, milestone achievements, publication honors,
            and consultation call-to-action.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded text-xs uppercase tracking-wider transition-colors"
          >
            <span>View Live /about</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs uppercase tracking-wider font-semibold shadow-lg shadow-red-950/40 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded flex items-center space-x-3 text-emerald-300 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>
            About page configuration successfully saved and persisted to repository. Live site cache revalidated.
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded flex items-center space-x-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: HERO & MAIN HEADLINE */}
        <div className="bg-[#0f0f14] border border-white/5 rounded-lg p-6 space-y-6">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Sparkles className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Page Header & Headline
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                Header Eyebrow Tag
              </label>
              <input
                type="text"
                value={about.eyebrow}
                onChange={(e) => setAbout({ ...about, eyebrow: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="About The Director & Studio"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                Main Headline
              </label>
              <textarea
                rows={2}
                value={about.headline}
                onChange={(e) => setAbout({ ...about, headline: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="A relentless pursuit of visual purity."
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                The full headline displayed in large editorial serif typography.
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                Italic Accent Portion
              </label>
              <input
                type="text"
                value={about.headlineItalic}
                onChange={(e) => setAbout({ ...about, headlineItalic: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="visual purity"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Substring within headline to render in elegant italic style (e.g. &quot;visual purity&quot;).
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: ARTIST PORTRAIT & TITLES */}
        <div className="bg-[#0f0f14] border border-white/5 rounded-lg p-6 space-y-6">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Camera className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Director Portrait & Editorial Identification
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Image Preview & Upload */}
            <div className="md:col-span-4 space-y-3">
              <label className="block text-xs uppercase tracking-wider text-neutral-400">
                Director Portrait Photo
              </label>
              <div className="relative aspect-[3/4] bg-black/60 border border-white/10 rounded overflow-hidden">
                {about.portraitImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={about.portraitImageUrl}
                    alt={about.directorName || 'Director'}
                    className="w-full h-full object-cover grayscale"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 text-xs">
                    <User className="w-8 h-8 mb-2 opacity-50" />
                    <span>No image specified</span>
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-white text-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-red-500 mb-2" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center justify-center space-x-2 w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded cursor-pointer text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors">
                  <Upload className="w-3.5 h-3.5 text-red-500" />
                  <span>Upload High-Res Portrait</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>

                <div>
                  <span className="text-[10px] text-neutral-500 block mb-1">Or direct Image URL:</span>
                  <input
                    type="text"
                    value={about.portraitImageUrl}
                    onChange={(e) => setAbout({ ...about, portraitImageUrl: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Director Details */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                  Director Full Name
                </label>
                <input
                  type="text"
                  value={about.directorName}
                  onChange={(e) => setAbout({ ...about, directorName: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  placeholder="Kiran Redd"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                    Primary Role / Title
                  </label>
                  <input
                    type="text"
                    value={about.directorRole}
                    onChange={(e) => setAbout({ ...about, directorRole: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                    placeholder="Creative Director"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                    Studio Sub-Role
                  </label>
                  <input
                    type="text"
                    value={about.directorSubRole}
                    onChange={(e) => setAbout({ ...about, directorSubRole: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                    placeholder="Founding Principal, REDD Studio"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                  Primary Bio Paragraph 1
                </label>
                <textarea
                  rows={4}
                  value={about.bioParagraph1}
                  onChange={(e) => setAbout({ ...about, bioParagraph1: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 leading-relaxed"
                  placeholder="Introductory biography..."
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                  Highlighted Philosophy Quote
                </label>
                <textarea
                  rows={3}
                  value={about.bioQuote}
                  onChange={(e) => setAbout({ ...about, bioQuote: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 italic leading-relaxed"
                  placeholder="&ldquo;Modernism in photography is not merely...&rdquo;"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                  Secondary Bio Paragraph 2 (Methodology & Disciplines)
                </label>
                <textarea
                  rows={3}
                  value={about.bioParagraph2}
                  onChange={(e) => setAbout({ ...about, bioParagraph2: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 leading-relaxed"
                  placeholder="Whether orchestrating a 20-person crew..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: MILESTONE COUNTERS */}
        <div className="bg-[#0f0f14] border border-white/5 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
                Milestone Counters & Statistics
              </h2>
            </div>
            <button
              type="button"
              onClick={addMilestone}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded text-xs uppercase tracking-wider font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-red-500" />
              <span>Add Counter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {about.milestones.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 bg-black/40 border border-white/10 rounded space-y-3 relative group"
              >
                <button
                  type="button"
                  onClick={() => removeMilestone(idx)}
                  className="absolute top-3 right-3 text-neutral-500 hover:text-red-400 transition-colors"
                  title="Remove milestone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Value / Metric
                  </label>
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleMilestoneChange(idx, 'value', e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded px-3 py-1.5 text-lg font-bold text-white font-editorial focus:outline-none focus:border-red-500"
                    placeholder="12+"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Label Description
                  </label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleMilestoneChange(idx, 'label', e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded px-3 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-red-500 uppercase tracking-wider"
                    placeholder="Years Behind Lens"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: PUBLICATION HONORS & RECOGNITION */}
        <div className="bg-[#0f0f14] border border-white/5 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
                Features & Recognition Honors
              </h2>
            </div>
            <button
              type="button"
              onClick={addHonor}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded text-xs uppercase tracking-wider font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-red-500" />
              <span>Add Honor Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                Section Eyebrow
              </label>
              <input
                type="text"
                value={about.honorsEyebrow}
                onChange={(e) => setAbout({ ...about, honorsEyebrow: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="Recognition"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={about.honorsTitle}
                onChange={(e) => setAbout({ ...about, honorsTitle: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="Features & Honors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {about.honorsList.map((honor, idx) => (
              <div
                key={honor.id || idx}
                className="p-4 bg-black/40 border border-white/10 rounded space-y-3 relative group"
              >
                <button
                  type="button"
                  onClick={() => removeHonor(idx)}
                  className="absolute top-2.5 right-2.5 text-neutral-500 hover:text-red-400 transition-colors"
                  title="Remove honor"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Publication / Award
                  </label>
                  <input
                    type="text"
                    value={honor.title}
                    onChange={(e) => handleHonorChange(idx, 'title', e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-sm font-semibold text-white uppercase focus:outline-none focus:border-red-500"
                    placeholder="VOGUE"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Subtitle / Detail
                  </label>
                  <input
                    type="text"
                    value={honor.subtitle}
                    onChange={(e) => handleHonorChange(idx, 'subtitle', e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-400 focus:outline-none focus:border-red-500"
                    placeholder="Scandinavia & Italia"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: GEAR SECTION TITLES */}
        <div className="bg-[#0f0f14] border border-white/5 rounded-lg p-6 space-y-6">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Camera className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Optical Arsenal Section Copy
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                Section Eyebrow
              </label>
              <input
                type="text"
                value={about.gearTitleEyebrow}
                onChange={(e) => setAbout({ ...about, gearTitleEyebrow: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="The Optical Arsenal"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                Section Main Title
              </label>
              <input
                type="text"
                value={about.gearTitle}
                onChange={(e) => setAbout({ ...about, gearTitle: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="Curated Production Gear"
              />
            </div>
          </div>
          <p className="text-[11px] text-neutral-500">
            Note: Specific cameras, lenses, and lighting systems in the kit are dynamically shared with the
            studio arsenal and can also be customized in the Studio Settings tab.
          </p>
        </div>

        {/* SECTION 6: CONSULTATION CTA BANNER */}
        <div className="bg-[#0f0f14] border border-white/5 rounded-lg p-6 space-y-6">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Sparkles className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Consultation Booking Call-To-Action
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                CTA Headline
              </label>
              <input
                type="text"
                value={about.ctaTitle}
                onChange={(e) => setAbout({ ...about, ctaTitle: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="Commission a Visual Narrative"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                CTA Subtitle / Description
              </label>
              <input
                type="text"
                value={about.ctaDescription}
                onChange={(e) => setAbout({ ...about, ctaDescription: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="Available for private sessions, high-fashion campaigns, and commercial briefs globally."
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={about.ctaButtonText}
                onChange={(e) => setAbout({ ...about, ctaButtonText: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="Request Shoot Consultation"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                Button Link
              </label>
              <input
                type="text"
                value={about.ctaButtonLink}
                onChange={(e) => setAbout({ ...about, ctaButtonLink: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="/contact"
              />
            </div>
          </div>
        </div>

        {/* Floating Bottom Action Bar */}
        <div className="sticky bottom-6 p-4 bg-[#101017]/95 backdrop-blur border border-white/10 rounded-lg flex items-center justify-between shadow-2xl z-20">
          <div className="text-xs text-neutral-400">
            Ensure changes are reviewed before publishing to live site.
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs uppercase tracking-wider font-semibold shadow-lg shadow-red-950/50 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Persisting...' : 'Save All About Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
