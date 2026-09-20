'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SeoAnalyticsSettings, SiteSettings } from '@/lib/types';
import {
  Globe,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Share2,
  Bot,
  BarChart3,
  Upload,
  Link as LinkIcon,
  ExternalLink,
  Code2,
  ShieldCheck,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

export default function AdminSeoPage() {
  const [seo, setSeo] = useState<SeoAnalyticsSettings | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'google' | 'meta' | 'ai'>('general');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Keyword tag input state
  const [keywordInput, setKeywordInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [seoRes, settingsRes] = await Promise.all([
        fetch('/api/seo'),
        fetch('/api/settings'),
      ]);
      const seoData = await seoRes.json();
      const settingsData = await settingsRes.json();

      if (seoData.seo) setSeo(seoData.seo);
      if (settingsData.settings) setSiteSettings(settingsData.settings);
    } catch (err) {
      console.error('Error fetching SEO data:', err);
      showNotification('error', 'Failed to load SEO settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!seo) return;

    setSaving(true);
    try {
      const res = await fetch('/api/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: seo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update SEO settings');

      setSeo(data.seo);
      showNotification('success', 'SEO, Analytics & AI settings saved successfully!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        showNotification('error', err.message);
      } else {
        showNotification('error', 'Error saving settings.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !seo) return;

    setUploadingImage(true);
    try {
      const safeName = (file.name || 'og-image.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
      const formData = new FormData();
      formData.append('file', file, safeName);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const responseText = await res.text();
      const data = responseText ? JSON.parse(responseText) : {};
      if (!res.ok) throw new Error(data.error || `Upload failed with status ${res.status}`);

      setSeo({
        ...seo,
        ogImageUrl: data.url,
      });
      showNotification('success', 'OpenGraph share image uploaded!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        showNotification('error', err.message);
      } else {
        showNotification('error', 'Failed to upload share image.');
      }
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addKeyword = () => {
    if (!keywordInput.trim() || !seo) return;
    const trimmed = keywordInput.trim();
    if (!seo.keywords.includes(trimmed)) {
      setSeo({
        ...seo,
        keywords: [...seo.keywords, trimmed],
      });
    }
    setKeywordInput('');
  };

  const removeKeyword = (kwToRemove: string) => {
    if (!seo) return;
    setSeo({
      ...seo,
      keywords: seo.keywords.filter((k) => k !== kwToRemove),
    });
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  if (loading || !seo) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
        <p className="text-xs uppercase tracking-widest text-neutral-400">Loading SEO & Analytics Config...</p>
      </div>
    );
  }

  // Generate Sample JSON-LD Preview
  const sampleJsonLd = {
    '@context': 'https://schema.org',
    '@type': seo.schemaType || 'Photographer',
    name: siteSettings?.brandName || 'REDD Photography Creations',
    founder: siteSettings?.artistName || 'Kiran Redd',
    url: seo.canonicalUrl || 'https://reddphotographycreations.com',
    image: seo.ogImageUrl,
    email: siteSettings?.email,
    telephone: siteSettings?.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteSettings?.location || 'New York / Paris / Milan',
    },
    knowsAbout: ['Haute Couture Fashion', 'Fine-Art Boudoir', 'Cinematic Portraits', 'Luxury Commercial'],
    priceRange: '$$$$',
  };

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-red-500 font-semibold block mb-1">
            Visibility, Intelligence & Discovery
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white tracking-tight">
            SEO, Analytics & AI Platform Manager
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Configure Google search indexing & GA4 tracking, Meta pixel & OpenGraph previews, and Generative Engine Optimization (GEO) for AI engines.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
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

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'general'
              ? 'border-red-600 text-white bg-white/[0.02]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4 text-red-500" />
          <span>General SEO & Indexing</span>
        </button>

        <button
          onClick={() => setActiveTab('google')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'google'
              ? 'border-red-600 text-white bg-white/[0.02]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span>Google Platform & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('meta')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'meta'
              ? 'border-red-600 text-white bg-white/[0.02]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Share2 className="w-4 h-4 text-pink-500" />
          <span>Meta & Social Platforms</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'ai'
              ? 'border-red-600 text-white bg-white/[0.02]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4 text-purple-400" />
          <span>AI Platforms & GEO Engine</span>
        </button>
      </div>

      {/* TAB 1: GENERAL SEO */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="p-6 bg-[#0e0e14] border border-white/5 rounded-sm space-y-5">
            <h3 className="font-editorial text-xl font-bold text-white border-b border-white/5 pb-2">
              Primary Search Engine Metadata
            </h3>

            {/* Title */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="uppercase tracking-wider text-neutral-300 font-medium">
                  Website Meta Title <span className="text-red-500">*</span>
                </label>
                <span className={`font-mono text-[10px] ${seo.metaTitle.length > 60 ? 'text-amber-400' : 'text-neutral-500'}`}>
                  {seo.metaTitle.length} / 60 characters (recommended: 50–60)
                </span>
              </div>
              <input
                type="text"
                value={seo.metaTitle}
                onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                placeholder="REDD Photography Creations | Haute Couture & Boudoir"
                className="w-full bg-[#14141b] border border-white/10 p-3 text-white focus:outline-none focus:border-red-600 text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="uppercase tracking-wider text-neutral-300 font-medium">
                  Meta Description <span className="text-red-500">*</span>
                </label>
                <span className={`font-mono text-[10px] ${seo.metaDescription.length > 160 ? 'text-amber-400' : 'text-neutral-500'}`}>
                  {seo.metaDescription.length} / 160 characters (recommended: 140–160)
                </span>
              </div>
              <textarea
                rows={3}
                value={seo.metaDescription}
                onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                placeholder="Concise summary that appears in Google search engine results under the title..."
                className="w-full bg-[#14141b] border border-white/10 p-3 text-white focus:outline-none focus:border-red-600 text-sm leading-relaxed resize-none"
              />
            </div>

            {/* Canonical Base URL */}
            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider text-neutral-300 text-xs font-medium">
                Canonical Site Base URL
              </label>
              <input
                type="text"
                value={seo.canonicalUrl}
                onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                placeholder="https://reddphotographycreations.com"
                className="w-full bg-[#14141b] border border-white/10 p-3 text-white font-mono text-xs focus:outline-none focus:border-red-600"
              />
              <span className="text-[10px] text-neutral-500 block">
                Used to prevent duplicate content penalties and declare authoritative URLs for sitemaps.
              </span>
            </div>

            {/* Keywords Tag Manager */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="block uppercase tracking-wider text-neutral-300 text-xs font-medium">
                Focus Keywords & Search Terms ({seo.keywords.length} defined)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  placeholder="Type a keyword and press Enter or click Add..."
                  className="flex-1 bg-[#14141b] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-red-600"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-colors"
                >
                  Add Keyword
                </button>
              </div>

              {/* Keyword Chips */}
              <div className="flex flex-wrap gap-2 pt-2">
                {seo.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center space-x-1.5 bg-white/5 border border-white/10 text-neutral-300 px-3 py-1 rounded text-xs font-mono"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      className="text-neutral-500 hover:text-red-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Robots Indexing Directives */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <label className="p-4 bg-[#14141b] border border-white/10 rounded flex items-center justify-between cursor-pointer">
                <div>
                  <span className="block text-white text-xs font-medium">Index in Search Engines</span>
                  <span className="text-[10px] text-neutral-500">Allow Google & Bing to index public pages</span>
                </div>
                <input
                  type="checkbox"
                  checked={seo.robotsIndex}
                  onChange={(e) => setSeo({ ...seo, robotsIndex: e.target.checked })}
                  className="w-4 h-4 accent-red-600"
                />
              </label>

              <label className="p-4 bg-[#14141b] border border-white/10 rounded flex items-center justify-between cursor-pointer">
                <div>
                  <span className="block text-white text-xs font-medium">Follow Page Links</span>
                  <span className="text-[10px] text-neutral-500">Allow crawlers to follow links throughout portfolio</span>
                </div>
                <input
                  type="checkbox"
                  checked={seo.robotsFollow}
                  onChange={(e) => setSeo({ ...seo, robotsFollow: e.target.checked })}
                  className="w-4 h-4 accent-red-600"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE & ANALYTICS */}
      {activeTab === 'google' && (
        <div className="space-y-6">
          <div className="p-6 bg-[#0e0e14] border border-white/5 rounded-sm space-y-6">
            <h3 className="font-editorial text-xl font-bold text-white border-b border-white/5 pb-2 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span>Google Analytics, Tag Manager & Verification</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GA4 ID */}
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-neutral-300 text-xs font-medium">
                  Google Analytics 4 (GA4) Measurement ID
                </label>
                <input
                  type="text"
                  value={seo.googleAnalyticsId || ''}
                  onChange={(e) => setSeo({ ...seo, googleAnalyticsId: e.target.value.trim() })}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full bg-[#14141b] border border-white/10 p-3 text-white font-mono text-xs focus:outline-none focus:border-red-600"
                />
                <span className="text-[10px] text-neutral-500 block">
                  Find this in your Google Analytics Data Stream settings. Automatically activates tracking script.
                </span>
              </div>

              {/* GTM Container ID */}
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-neutral-300 text-xs font-medium">
                  Google Tag Manager (GTM) Container ID
                </label>
                <input
                  type="text"
                  value={seo.googleTagManagerId || ''}
                  onChange={(e) => setSeo({ ...seo, googleTagManagerId: e.target.value.trim() })}
                  placeholder="GTM-XXXXXXX"
                  className="w-full bg-[#14141b] border border-white/10 p-3 text-white font-mono text-xs focus:outline-none focus:border-red-600"
                />
                <span className="text-[10px] text-neutral-500 block">
                  Optional. If using Google Tag Manager to coordinate multiple conversion tags.
                </span>
              </div>

              {/* Google Search Console Verification */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block uppercase tracking-wider text-neutral-300 text-xs font-medium">
                  Google Search Console Verification Token / Content
                </label>
                <input
                  type="text"
                  value={seo.googleSiteVerification || ''}
                  onChange={(e) => setSeo({ ...seo, googleSiteVerification: e.target.value.trim() })}
                  placeholder="e.g. 4vX_8u3L1B8kXkY_9z..."
                  className="w-full bg-[#14141b] border border-white/10 p-3 text-white font-mono text-xs focus:outline-none focus:border-red-600"
                />
                <span className="text-[10px] text-neutral-500 block">
                  Inserts &lt;meta name=&quot;google-site-verification&quot; content=&quot;...&quot; /&gt; automatically into the HTML &lt;head&gt;.
                </span>
              </div>
            </div>

            {/* Schema.org Structured Data */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white text-sm font-semibold flex items-center space-x-2">
                    <Code2 className="w-4 h-4 text-green-400" />
                    <span>Schema.org JSON-LD Structured Data</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Provides Google with machine-readable rich snippets for photography studios, local hubs, and artist credits.
                  </p>
                </div>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={seo.enableSchemaOrg}
                    onChange={(e) => setSeo({ ...seo, enableSchemaOrg: e.target.checked })}
                    className="w-4 h-4 accent-red-600"
                  />
                  <span className="text-xs text-white font-medium">Enable Structured Data</span>
                </label>
              </div>

              {seo.enableSchemaOrg && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(['Photographer', 'LocalBusiness', 'ProfessionalService'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSeo({ ...seo, schemaType: st })}
                        className={`p-3 rounded border text-left transition-colors cursor-pointer ${
                          seo.schemaType === st
                            ? 'bg-red-600/10 border-red-600 text-white'
                            : 'bg-[#14141b] border-white/10 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <span className="block font-medium text-xs text-white">{st}</span>
                        <span className="text-[10px] text-neutral-500">
                          {st === 'Photographer'
                            ? 'Optimal for fine-art & personal branding'
                            : st === 'LocalBusiness'
                            ? 'Strong local SEO across Paris/NY/Milan'
                            : 'B2B commercial studio focus'}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Schema Preview */}
                  <div className="p-4 bg-black/60 border border-white/10 rounded font-mono text-[11px] text-neutral-300 overflow-x-auto">
                    <span className="text-neutral-500 block mb-1">// Active JSON-LD Structured Snippet:</span>
                    <pre className="text-green-400 whitespace-pre-wrap">{JSON.stringify(sampleJsonLd, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: META & SOCIAL */}
      {activeTab === 'meta' && (
        <div className="space-y-6">
          <div className="p-6 bg-[#0e0e14] border border-white/5 rounded-sm space-y-6">
            <h3 className="font-editorial text-xl font-bold text-white border-b border-white/5 pb-2 flex items-center space-x-2">
              <Share2 className="w-5 h-5 text-pink-500" />
              <span>Meta (Facebook, Instagram) Pixel & OpenGraph</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Meta Pixel ID */}
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-neutral-300 text-xs font-medium">
                  Meta Pixel ID (Facebook & Instagram Tracking)
                </label>
                <input
                  type="text"
                  value={seo.metaPixelId || ''}
                  onChange={(e) => setSeo({ ...seo, metaPixelId: e.target.value.trim() })}
                  placeholder="e.g. 123456789012345"
                  className="w-full bg-[#14141b] border border-white/10 p-3 text-white font-mono text-xs focus:outline-none focus:border-red-600"
                />
                <span className="text-[10px] text-neutral-500 block">
                  Enables Meta Pixel conversion tracking for Instagram and Facebook advertising campaigns.
                </span>
              </div>

              {/* Meta Domain Verification */}
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-neutral-300 text-xs font-medium">
                  Meta Domain Verification Token
                </label>
                <input
                  type="text"
                  value={seo.metaDomainVerification || ''}
                  onChange={(e) => setSeo({ ...seo, metaDomainVerification: e.target.value.trim() })}
                  placeholder="e.g. 7k8p9m0x1z..."
                  className="w-full bg-[#14141b] border border-white/10 p-3 text-white font-mono text-xs focus:outline-none focus:border-red-600"
                />
                <span className="text-[10px] text-neutral-500 block">
                  Inserts &lt;meta name=&quot;facebook-domain-verification&quot; content=&quot;...&quot; /&gt; to verify domain ownership in Meta Business Manager.
                </span>
              </div>

              {/* Twitter Card Type */}
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-neutral-300 text-xs font-medium">
                  Twitter / X Card Layout
                </label>
                <select
                  value={seo.twitterCardType}
                  onChange={(e) =>
                    setSeo({
                      ...seo,
                      twitterCardType: e.target.value as 'summary_large_image' | 'summary',
                    })
                  }
                  className="w-full bg-[#14141b] border border-white/10 p-3 text-white text-xs focus:outline-none focus:border-red-600"
                >
                  <option value="summary_large_image">Large Image Card (Recommended for Photography)</option>
                  <option value="summary">Compact Summary Card</option>
                </select>
              </div>

              {/* Twitter Handle */}
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-neutral-300 text-xs font-medium">
                  Twitter / X Handle
                </label>
                <input
                  type="text"
                  value={seo.twitterHandle || ''}
                  onChange={(e) => setSeo({ ...seo, twitterHandle: e.target.value.trim() })}
                  placeholder="@reddphotography"
                  className="w-full bg-[#14141b] border border-white/10 p-3 text-white font-mono text-xs focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* OpenGraph Image Upload & Preview */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <h4 className="text-white text-sm font-semibold">
                Default OpenGraph Social Share Card Image
              </h4>
              <p className="text-[11px] text-neutral-400">
                This image appears whenever someone shares your studio URL on iMessage, WhatsApp, Facebook, LinkedIn, or Twitter.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-6 space-y-4">
                  {/* Upload button */}
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      id="og-file-upload"
                    />
                    <label
                      htmlFor="og-file-upload"
                      className="flex items-center justify-center space-x-2 p-3 border border-dashed border-white/20 hover:border-red-500 rounded bg-black/40 cursor-pointer transition-colors text-xs text-white"
                    >
                      <Upload className="w-4 h-4 text-red-500" />
                      <span>{uploadingImage ? 'Uploading Image...' : 'Upload New Share Image (1200x630)'}</span>
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-neutral-400 text-[10px] font-medium">
                      Or Direct Image URL
                    </label>
                    <input
                      type="text"
                      value={seo.ogImageUrl || ''}
                      onChange={(e) => setSeo({ ...seo, ogImageUrl: e.target.value })}
                      placeholder="https://... or /uploads/..."
                      className="w-full bg-[#14141b] border border-white/10 p-2.5 text-white font-mono text-xs focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {/* Live Social Share Card Preview */}
                <div className="md:col-span-6">
                  <span className="text-[10px] uppercase font-mono text-neutral-500 block mb-2">
                    Social Card Live Preview:
                  </span>
                  <div className="border border-white/10 rounded-sm overflow-hidden bg-[#121218] shadow-xl">
                    <div className="aspect-[1.91/1] bg-black relative">
                      {seo.ogImageUrl ? (
                        <img
                          src={seo.ogImageUrl}
                          alt="OpenGraph preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                          No Image Configured
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-1">
                      <span className="text-[9px] uppercase font-mono text-neutral-500">
                        {seo.canonicalUrl.replace('https://', '') || 'reddphotographycreations.com'}
                      </span>
                      <h5 className="text-white text-xs font-bold truncate">
                        {seo.ogTitle || seo.metaTitle}
                      </h5>
                      <p className="text-neutral-400 text-[11px] line-clamp-2">
                        {seo.ogDescription || seo.metaDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI PLATFORMS & GEO */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="p-6 bg-[#0e0e14] border border-white/5 rounded-sm space-y-6">
            <div>
              <h3 className="font-editorial text-xl font-bold text-white flex items-center space-x-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <span>Generative Engine Optimization (GEO) & AI Bot Permissions</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Govern how leading generative AI platforms crawl, index, and cite your studio and photographs in AI search answers (ChatGPT, Claude, Perplexity, Gemini).
              </p>
            </div>

            {/* AI Bot Toggles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {/* GPTBot */}
              <div className="p-4 bg-[#14141b] border border-white/10 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-white">OpenAI GPTBot</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={seo.allowGptBot}
                    onChange={(e) => setSeo({ ...seo, allowGptBot: e.target.checked })}
                    className="w-4 h-4 accent-red-600"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  Allows ChatGPT Search and OpenAI models to index portfolio works and cite REDD for luxury photography queries.
                </p>
              </div>

              {/* ClaudeBot */}
              <div className="p-4 bg-[#14141b] border border-white/10 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-xs font-semibold text-white">Anthropic ClaudeBot</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={seo.allowClaudeBot}
                    onChange={(e) => setSeo({ ...seo, allowClaudeBot: e.target.checked })}
                    className="w-4 h-4 accent-red-600"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  Permits Anthropic Claude web indexing and citation for commercial campaigns and fine-art inquiries.
                </p>
              </div>

              {/* PerplexityBot */}
              <div className="p-4 bg-[#14141b] border border-white/10 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="text-xs font-semibold text-white">PerplexityBot</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={seo.allowPerplexityBot}
                    onChange={(e) => setSeo({ ...seo, allowPerplexityBot: e.target.checked })}
                    className="w-4 h-4 accent-red-600"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  Powers instant answers with web links on Perplexity AI Search when collectors or clients search for photographers.
                </p>
              </div>

              {/* Google-Extended */}
              <div className="p-4 bg-[#14141b] border border-white/10 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span className="text-xs font-semibold text-white">Google-Extended</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={seo.allowGoogleExtended}
                    onChange={(e) => setSeo({ ...seo, allowGoogleExtended: e.target.checked })}
                    className="w-4 h-4 accent-red-600"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  Governs inclusion in Google Gemini and AI Overviews in Google Search without impacting standard Google Search indexing.
                </p>
              </div>

              {/* Applebot-Extended */}
              <div className="p-4 bg-[#14141b] border border-white/10 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                    <span className="text-xs font-semibold text-white">Applebot-Extended</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={seo.allowAppleBot}
                    onChange={(e) => setSeo({ ...seo, allowAppleBot: e.target.checked })}
                    className="w-4 h-4 accent-red-600"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  Controls Apple Intelligence citations, Siri suggestions, and Spotlight search indexing across Apple devices.
                </p>
              </div>

              {/* Common Crawl */}
              <div className="p-4 bg-[#14141b] border border-white/10 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="text-xs font-semibold text-white">Common Crawl (CCBot)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={seo.allowCommonCrawl}
                    onChange={(e) => setSeo({ ...seo, allowCommonCrawl: e.target.checked })}
                    className="w-4 h-4 accent-red-600"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  Open-access dataset crawler utilized by broad open-source AI models and academic research datasets.
                </p>
              </div>
            </div>

            {/* AI Semantic Studio Synopsis for LLMs */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white text-sm font-semibold flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>AI Studio Synopsis &amp; Knowledge Statement</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    A clear, factual summary of the studio formatted for generative AI search engines and served via{' '}
                    <a href="/llms.txt" target="_blank" className="text-red-400 underline inline-flex items-center space-x-1">
                      <span>/llms.txt</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              </div>

              <textarea
                rows={4}
                value={seo.aiStudioSynopsis || ''}
                onChange={(e) => setSeo({ ...seo, aiStudioSynopsis: e.target.value })}
                placeholder="State clearly who founded the studio, signature disciplines, technical medium-format gear, key locations, and commission protocols..."
                className="w-full bg-[#14141b] border border-white/10 p-3 text-white text-xs leading-relaxed focus:outline-none focus:border-red-600 font-mono resize-none"
              />
            </div>

            {/* Quick Links for Verification */}
            <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs">
              <span className="text-neutral-500 uppercase font-mono text-[10px]">Test Live Directives:</span>
              <a
                href="/robots.txt"
                target="_blank"
                className="text-neutral-300 hover:text-white inline-flex items-center space-x-1 bg-white/5 px-3 py-1.5 rounded"
              >
                <span>Preview /robots.txt</span>
                <ExternalLink className="w-3 h-3 text-red-500" />
              </a>
              <a
                href="/sitemap.xml"
                target="_blank"
                className="text-neutral-300 hover:text-white inline-flex items-center space-x-1 bg-white/5 px-3 py-1.5 rounded"
              >
                <span>Preview /sitemap.xml</span>
                <ExternalLink className="w-3 h-3 text-red-500" />
              </a>
              <a
                href="/llms.txt"
                target="_blank"
                className="text-neutral-300 hover:text-white inline-flex items-center space-x-1 bg-white/5 px-3 py-1.5 rounded"
              >
                <span>Preview /llms.txt</span>
                <ExternalLink className="w-3 h-3 text-red-500" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
