'use client';

import React, { useState, useEffect } from 'react';
import { ServicesPageSettings, ServiceOfferingItem, ProductionJourneyStep, CategoryItem } from '@/lib/types';
import {
  Save,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  Edit2,
  X,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Check,
} from 'lucide-react';

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServicesPageSettings | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal for editing/creating an offering
  const [editingOffering, setEditingOffering] = useState<ServiceOfferingItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFeatureText, setNewFeatureText] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/services').then((res) => res.json()),
      fetch('/api/categories?all=true').then((res) => res.json()).catch(() => ({ categories: [] })),
    ])
      .then(([servicesData, categoriesData]) => {
        if (servicesData.services) {
          setServices(servicesData.services);
        }
        if (categoriesData.categories) {
          setCategories(categoriesData.categories);
        }
      })
      .catch((err) => {
        console.error('Error fetching services settings:', err);
        setError('Failed to load Services page settings');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!services) return;

    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      let res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: services }),
      });

      if (res.status === 405) {
        res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: services }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save services settings');

      const savedData = data.services || services;
      try {
        localStorage.setItem('redd_services_data', JSON.stringify(savedData));
        window.dispatchEvent(
          new CustomEvent('redd_data_updated', { detail: { type: 'services', data: savedData } })
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

  // Offering Modal Handlers
  const openNewOfferingModal = () => {
    if (!services) return;
    setEditingOffering({
      id: `serv-${Date.now()}`,
      category: categories[0]?.slug || 'general',
      title: 'New Service Package',
      eyebrow: 'Bespoke Production',
      description: 'Comprehensive description of the photographic discipline and creative process.',
      features: [
        'Dedicated creative consultation & moodboard',
        'Master retouched deliverables',
        'Archival digital gallery',
      ],
      idealFor: 'Discerning clients, brands, and editorial teams',
      investment: 'From $2,500',
      buttonText: 'Inquire About This Service',
      buttonLink: '/contact',
      enabled: true,
      order: (services.offerings?.length || 0) + 1,
    });
    setNewFeatureText('');
    setIsModalOpen(true);
  };

  const openEditOfferingModal = (offering: ServiceOfferingItem) => {
    setEditingOffering({ ...offering, features: [...offering.features] });
    setNewFeatureText('');
    setIsModalOpen(true);
  };

  const saveOfferingModal = () => {
    if (!services || !editingOffering) return;

    const existingIndex = services.offerings.findIndex((o) => o.id === editingOffering.id);
    let nextOfferings = [...services.offerings];

    if (existingIndex >= 0) {
      nextOfferings[existingIndex] = editingOffering;
    } else {
      nextOfferings.push(editingOffering);
    }

    // Sort by order
    nextOfferings.sort((a, b) => a.order - b.order);

    setServices({ ...services, offerings: nextOfferings });
    setIsModalOpen(false);
    setEditingOffering(null);
  };

  const deleteOffering = (id: string) => {
    if (!services) return;
    if (!confirm('Are you sure you want to delete this service offering?')) return;
    const next = services.offerings.filter((o) => o.id !== id);
    setServices({ ...services, offerings: next });
  };

  const toggleOfferingEnabled = (id: string) => {
    if (!services) return;
    const next = services.offerings.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o));
    setServices({ ...services, offerings: next });
  };

  const moveOffering = (index: number, direction: 'up' | 'down') => {
    if (!services) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.offerings.length) return;

    const next = [...services.offerings];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    // Recalculate order values
    next.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setServices({ ...services, offerings: next });
  };

  const addFeatureToOffering = () => {
    if (!editingOffering || !newFeatureText.trim()) return;
    setEditingOffering({
      ...editingOffering,
      features: [...editingOffering.features, newFeatureText.trim()],
    });
    setNewFeatureText('');
  };

  const removeFeatureFromOffering = (featureIndex: number) => {
    if (!editingOffering) return;
    const nextFeatures = editingOffering.features.filter((_, i) => i !== featureIndex);
    setEditingOffering({
      ...editingOffering,
      features: nextFeatures,
    });
  };

  // Journey Step Handlers
  const handleJourneyStepChange = (index: number, field: keyof ProductionJourneyStep, value: string) => {
    if (!services) return;
    const next = [...services.journeySteps];
    next[index] = { ...next[index], [field]: value };
    setServices({ ...services, journeySteps: next });
  };

  const addJourneyStep = () => {
    if (!services) return;
    const nextNum = (services.journeySteps.length + 1).toString().padStart(2, '0');
    const newStep: ProductionJourneyStep = {
      id: `step-${Date.now()}`,
      stepNumber: `STEP ${nextNum}`,
      title: 'New Phase',
      description: 'Detail the collaborative production experience and deliverables.',
    };
    setServices({ ...services, journeySteps: [...services.journeySteps, newStep] });
  };

  const removeJourneyStep = (index: number) => {
    if (!services) return;
    const next = services.journeySteps.filter((_, i) => i !== index);
    setServices({ ...services, journeySteps: next });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!services) {
    return (
      <div className="p-8 text-center text-neutral-400">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p>Failed to load Services page configuration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Sparkles className="w-5 h-5 text-red-500" />
            <h1 className="font-editorial text-3xl text-white font-medium">Services Page Editor</h1>
          </div>
          <p className="text-xs text-neutral-400">
            Manage bespoke photography offerings, deliverables, pricing tiers, and the 4-step production experience.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/services"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded text-xs uppercase tracking-wider transition-colors"
          >
            <span>View Live /services</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => handleSave()}
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
            Services configuration successfully saved and persisted to repository. Live site cache revalidated.
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded flex items-center space-x-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={(e) => handleSave(e)} className="space-y-8">
        {/* SECTION 1: HEADER & INTRO TEXT */}
        <div className="bg-[#0f0f14] border border-white/5 rounded-lg p-6 space-y-6">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Sparkles className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Page Header & Introduction
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                Header Eyebrow Tag
              </label>
              <input
                type="text"
                value={services.eyebrow}
                onChange={(e) => setServices({ ...services, eyebrow: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="Bespoke Production Services"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                Main Headline
              </label>
              <input
                type="text"
                value={services.headline}
                onChange={(e) => setServices({ ...services, headline: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="Disciplines & Commissions"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                Italic Accent Portion
              </label>
              <input
                type="text"
                value={services.headlineItalic}
                onChange={(e) => setServices({ ...services, headlineItalic: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="Commissions"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                Introductory Overview Prose
              </label>
              <textarea
                rows={3}
                value={services.introText}
                onChange={(e) => setServices({ ...services, introText: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 leading-relaxed"
                placeholder="Every project is treated as an individual piece of art..."
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: SERVICE OFFERINGS CRUD */}
        <div className="bg-[#0f0f14] border border-white/5 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
                Service Disciplines & Packages ({services.offerings.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={openNewOfferingModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded text-xs uppercase tracking-wider font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-red-500" />
              <span>Add Service Offering</span>
            </button>
          </div>

          <div className="space-y-4">
            {services.offerings.map((offering, idx) => (
              <div
                key={offering.id}
                className={`p-5 rounded border transition-all ${
                  offering.enabled
                    ? 'bg-black/40 border-white/10 hover:border-white/20'
                    : 'bg-black/20 border-white/5 opacity-60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono text-neutral-500">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-red-500 font-semibold px-2 py-0.5 bg-red-950/40 rounded">
                        {offering.eyebrow}
                      </span>
                      <span className="text-xs font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded">
                        /{offering.category}
                      </span>
                      {!offering.enabled && (
                        <span className="text-[10px] uppercase tracking-wider text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/30">
                          Disabled
                        </span>
                      )}
                    </div>
                    <h3 className="font-editorial text-xl text-white font-medium">
                      {offering.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 max-w-3xl">
                      {offering.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-neutral-400">
                      <span>
                        <strong className="text-neutral-300 font-semibold">Pricing:</strong>{' '}
                        {offering.investment}
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-neutral-300 font-semibold">Deliverables:</strong>{' '}
                        {offering.features.length} items
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-neutral-300 font-semibold">Ideal For:</strong>{' '}
                        {offering.idealFor}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="flex items-center space-x-1 mr-2 border-r border-white/10 pr-2">
                      <button
                        type="button"
                        onClick={() => moveOffering(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20 transition-colors"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveOffering(idx, 'down')}
                        disabled={idx === services.offerings.length - 1}
                        className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20 transition-colors"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleOfferingEnabled(offering.id)}
                      className={`p-2 rounded text-xs transition-colors ${
                        offering.enabled
                          ? 'text-emerald-400 hover:bg-emerald-950/40'
                          : 'text-neutral-500 hover:bg-white/5'
                      }`}
                      title={offering.enabled ? 'Disable Service' : 'Enable Service'}
                    >
                      {offering.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditOfferingModal(offering)}
                      className="p-2 text-neutral-300 hover:text-white hover:bg-white/5 rounded transition-colors"
                      title="Edit Service Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteOffering(offering.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: PRODUCTION JOURNEY STEPS */}
        <div className="bg-[#0f0f14] border border-white/5 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
                The Production Journey Steps ({services.journeySteps.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={addJourneyStep}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded text-xs uppercase tracking-wider font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-red-500" />
              <span>Add Step</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                Journey Section Eyebrow
              </label>
              <input
                type="text"
                value={services.journeyEyebrow}
                onChange={(e) => setServices({ ...services, journeyEyebrow: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="The Experience"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                Journey Section Main Title
              </label>
              <input
                type="text"
                value={services.journeyTitle}
                onChange={(e) => setServices({ ...services, journeyTitle: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="From Concept to Master Print"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {services.journeySteps.map((step, idx) => (
              <div
                key={step.id || idx}
                className="p-4 bg-black/40 border border-white/10 rounded space-y-3 relative group"
              >
                <button
                  type="button"
                  onClick={() => removeJourneyStep(idx)}
                  className="absolute top-2.5 right-2.5 text-neutral-500 hover:text-red-400 transition-colors"
                  title="Remove step"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Step Indicator
                  </label>
                  <input
                    type="text"
                    value={step.stepNumber}
                    onChange={(e) => handleJourneyStepChange(idx, 'stepNumber', e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1 text-xs text-red-400 font-mono focus:outline-none focus:border-red-500"
                    placeholder="STEP 01"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Step Title
                  </label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => handleJourneyStepChange(idx, 'title', e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1 text-sm font-medium text-white focus:outline-none focus:border-red-500"
                    placeholder="Vision Consultation"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={step.description}
                    onChange={(e) => handleJourneyStepChange(idx, 'description', e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-red-500 leading-relaxed"
                    placeholder="Describe step..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: CTA BANNER */}
        <div className="bg-[#0f0f14] border border-white/5 rounded-lg p-6 space-y-6">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Sparkles className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Bottom Call-To-Action (Optional)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                CTA Title
              </label>
              <input
                type="text"
                value={services.ctaTitle || ''}
                onChange={(e) => setServices({ ...services, ctaTitle: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="Commission a Bespoke Production"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                CTA Button Text
              </label>
              <input
                type="text"
                value={services.ctaButtonText || ''}
                onChange={(e) => setServices({ ...services, ctaButtonText: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="Initiate Booking Proposal"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                CTA Description
              </label>
              <input
                type="text"
                value={services.ctaDescription || ''}
                onChange={(e) => setServices({ ...services, ctaDescription: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="Whether an editorial lookbook, intimate portraiture, or luxury brand advertising."
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                CTA Button Link
              </label>
              <input
                type="text"
                value={services.ctaButtonLink || ''}
                onChange={(e) => setServices({ ...services, ctaButtonLink: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                placeholder="/contact"
              />
            </div>
          </div>
        </div>

        {/* Floating Bottom Action Bar */}
        <div className="sticky bottom-6 p-4 bg-[#101017]/95 backdrop-blur border border-white/10 rounded-lg flex items-center justify-between shadow-2xl z-20">
          <div className="text-xs text-neutral-400">
            Publish all offerings, pricing, and journey steps to live site.
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs uppercase tracking-wider font-semibold shadow-lg shadow-red-950/50 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Persisting...' : 'Save All Services Settings'}</span>
          </button>
        </div>
      </form>

      {/* EDIT / CREATE OFFERING MODAL */}
      {isModalOpen && editingOffering && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f0f14] border border-white/10 rounded-lg max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-editorial text-2xl text-white">
                  {services.offerings.some((o) => o.id === editingOffering.id)
                    ? 'Edit Service Offering'
                    : 'Create Service Offering'}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Configure package deliverables, category tag, and pricing tier.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">
                    Discipline / Category
                  </label>
                  <select
                    value={editingOffering.category}
                    onChange={(e) => setEditingOffering({ ...editingOffering, category: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.label} ({c.slug})
                      </option>
                    ))}
                    {!categories.some((c) => c.slug === editingOffering.category) && (
                      <option value={editingOffering.category}>{editingOffering.category}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">
                    Eyebrow / Sub-tag
                  </label>
                  <input
                    type="text"
                    value={editingOffering.eyebrow}
                    onChange={(e) => setEditingOffering({ ...editingOffering, eyebrow: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                    placeholder="Editorial Campaigns & Lookbooks"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">
                  Offering Title
                </label>
                <input
                  type="text"
                  value={editingOffering.title}
                  onChange={(e) => setEditingOffering({ ...editingOffering, title: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  placeholder="Haute Couture & Editorial Fashion"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">
                  Full Service Description
                </label>
                <textarea
                  rows={3}
                  value={editingOffering.description}
                  onChange={(e) => setEditingOffering({ ...editingOffering, description: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 leading-relaxed"
                  placeholder="Describe the approach and visual narrative..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">
                    Starting Investment / Pricing
                  </label>
                  <input
                    type="text"
                    value={editingOffering.investment}
                    onChange={(e) => setEditingOffering({ ...editingOffering, investment: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
                    placeholder="From $6,500 or Custom Quote"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">
                    Ideal Clientele
                  </label>
                  <input
                    type="text"
                    value={editingOffering.idealFor}
                    onChange={(e) => setEditingOffering({ ...editingOffering, idealFor: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                    placeholder="Designers, magazines, modeling agencies..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={editingOffering.buttonText}
                    onChange={(e) => setEditingOffering({ ...editingOffering, buttonText: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                    placeholder="Inquire About This Service"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={editingOffering.buttonLink}
                    onChange={(e) => setEditingOffering({ ...editingOffering, buttonLink: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
                    placeholder={`/contact?category=${editingOffering.category}`}
                  />
                </div>
              </div>

              {/* Dynamic Deliverables / Production Elements */}
              <div className="pt-2 border-t border-white/10">
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                  Included Production Elements & Deliverables ({editingOffering.features.length})
                </label>

                <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                  {editingOffering.features.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-center justify-between p-2.5 bg-black/50 border border-white/10 rounded text-xs text-neutral-200"
                    >
                      <div className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeatureFromOffering(fIdx)}
                        className="text-neutral-500 hover:text-red-400 transition-colors ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeatureToOffering();
                      }
                    }}
                    className="flex-1 bg-black/60 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    placeholder="Type deliverable item and press Enter..."
                  />
                  <button
                    type="button"
                    onClick={addFeatureToOffering}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white rounded text-xs uppercase tracking-wider font-semibold transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingOffering.enabled}
                    onChange={(e) => setEditingOffering({ ...editingOffering, enabled: e.target.checked })}
                    className="w-4 h-4 rounded bg-black border-white/20 text-red-600 focus:ring-red-500"
                  />
                  <span>Enable this service package on live public /services page</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 rounded text-xs uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveOfferingModal}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
