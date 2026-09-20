'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SiteSettings, NavItem } from '@/lib/types';
import {
  Menu as MenuIcon,
  PanelTop,
  Upload,
  Link as LinkIcon,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Power,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Check,
  ExternalLink,
  Eye,
  Sliders,
  Image as ImageIcon,
  Compass,
} from 'lucide-react';

export default function AdminNavigationPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState<'header' | 'footer'>('header');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State for Add / Edit Nav Item
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditingNav, setIsEditingNav] = useState(false);
  const [currentEditNavId, setCurrentEditNavId] = useState<string | null>(null);

  const initialNavForm: {
    label: string;
    href: string;
    isExternal: boolean;
    order: number;
    enabled: boolean;
  } = {
    label: '',
    href: '',
    isExternal: false,
    order: 1,
    enabled: true,
  };
  const [navForm, setNavForm] = useState(initialNavForm);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      showNotification('error', 'Failed to load navigation settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (updatedOverrides?: Partial<SiteSettings>) => {
    if (!settings) return;
    setSaving(true);
    try {
      const payload = {
        settingsUpdates: {
          ...settings,
          ...updatedOverrides,
        },
      };

      let res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // If 405 Method Not Allowed (e.g. from static edge proxy cache), fallback to POST
      if (res.status === 405) {
        res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const responseText = await res.text();
      let data: { success?: boolean; error?: string; settings?: SiteSettings } = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          res.ok
            ? 'Server returned an invalid response format.'
            : `Failed to save (Status ${res.status}): ${responseText.slice(0, 100)}`
        );
      }

      if (!res.ok) throw new Error(data.error || `Failed to save settings (${res.status})`);

      if (data.settings) {
        setSettings(data.settings);
        try {
          localStorage.setItem('redd_site_settings', JSON.stringify(data.settings));
          window.dispatchEvent(new Event('redd_settings_updated'));
          window.dispatchEvent(new CustomEvent('redd_data_updated', { detail: { type: 'settings', data: data.settings } }));
        } catch {}
      }
      showNotification('success', 'Navigation, Logo & Footer settings saved successfully!');
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

  // Logo file upload handler with Safari/WebKit compatibility & dual fallback
  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>
  ) => {
    let file: File | null = null;
    if ('target' in e && e.target && 'files' in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e && e.dataTransfer && e.dataTransfer.files) {
      file = e.dataTransfer.files[0];
    }

    if (!file || !settings) return;

    if (file.size > 10 * 1024 * 1024) {
      showNotification('error', 'Image file is too large. Maximum supported size is 10MB.');
      return;
    }

    setUploadingLogo(true);
    try {
      let uploadedUrl = '';

      // Clean ASCII-only file name for Safari/WebKit compatibility
      const rawExt = file.name ? file.name.substring(file.name.lastIndexOf('.')) : '.png';
      const cleanBase = (file.name ? file.name.replace(/\.[^/.]+$/, '') : 'logo')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 40) || 'logo';
      const safeName = `${cleanBase}${rawExt || '.png'}`;

      try {
        // Method A: Multipart FormData with sanitized ASCII filename
        const formData = new FormData();
        formData.append('file', file, safeName);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const responseText = await res.text();
        let data: { success?: boolean; url?: string; error?: string } = {};
        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch {
          throw new Error(`Upload server error (${res.status}): ${responseText.slice(0, 100)}`);
        }

        if (res.ok && data.url) {
          uploadedUrl = data.url;
        } else {
          throw new Error(data.error || `Upload failed with status ${res.status}`);
        }
      } catch (uploadErr) {
        console.warn('FormData upload failed, trying Base64 data transfer fallback:', uploadErr);
        // Method B: Base64 data URL fallback via FileReader
        uploadedUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async () => {
            const dataUrl = reader.result as string;
            try {
              const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dataUrl, fileName: safeName }),
              });
              const text = await res.text();
              const json = text ? JSON.parse(text) : {};
              if (res.ok && json.url) {
                resolve(json.url);
              } else {
                resolve(dataUrl);
              }
            } catch {
              resolve(dataUrl);
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file from local device.'));
          reader.readAsDataURL(file);
        });
      }

      if (!uploadedUrl) {
        throw new Error('Could not process or store uploaded logo.');
      }

      const updated = {
        ...settings,
        logoUrl: uploadedUrl,
      };
      setSettings(updated);
      await handleSaveSettings(updated);
      showNotification('success', 'Brand logo uploaded and saved successfully!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        showNotification('error', err.message);
      } else {
        showNotification('error', 'Failed to upload logo image.');
      }
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!settings) return;
    const updated = { ...settings, logoUrl: '' };
    setSettings(updated);
    await handleSaveSettings(updated);
    showNotification('success', 'Custom logo removed. Reverted to typographic wordmark.');
  };

  // Nav Links Management
  const openAddNavModal = () => {
    setIsEditingNav(false);
    setCurrentEditNavId(null);
    setNavForm({
      ...initialNavForm,
      order: ((settings?.headerNav?.length || 0) + 1) * 1,
    });
    setModalOpen(true);
  };

  const openEditNavModal = (item: NavItem) => {
    setIsEditingNav(true);
    setCurrentEditNavId(item.id);
    setNavForm({
      label: item.label,
      href: item.href,
      isExternal: Boolean(item.isExternal),
      order: item.order || 1,
      enabled: item.enabled,
    });
    setModalOpen(true);
  };

  const handleSaveNavItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    let updatedNav = [...(settings.headerNav || [])];

    if (isEditingNav && currentEditNavId) {
      updatedNav = updatedNav.map((item) =>
        item.id === currentEditNavId
          ? {
              ...item,
              label: navForm.label.trim().toUpperCase(),
              href: navForm.href.trim(),
              isExternal: navForm.isExternal,
              order: navForm.order,
              enabled: navForm.enabled,
            }
          : item
      );
    } else {
      const newItem: NavItem = {
        id: `nav-${Date.now()}`,
        label: navForm.label.trim().toUpperCase(),
        href: navForm.href.trim(),
        isExternal: navForm.isExternal,
        order: navForm.order,
        enabled: navForm.enabled,
      };
      updatedNav.push(newItem);
    }

    updatedNav.sort((a, b) => a.order - b.order);

    const updatedSettings = {
      ...settings,
      headerNav: updatedNav,
    };

    setSettings(updatedSettings);
    setModalOpen(false);
    await handleSaveSettings(updatedSettings);
  };

  const handleToggleNavEnabled = async (item: NavItem) => {
    if (!settings) return;
    const updatedNav = (settings.headerNav || []).map((n) =>
      n.id === item.id ? { ...n, enabled: !n.enabled } : n
    );
    const updatedSettings = { ...settings, headerNav: updatedNav };
    setSettings(updatedSettings);
    await handleSaveSettings(updatedSettings);
  };

  const handleReorderNav = async (item: NavItem, direction: 'up' | 'down') => {
    if (!settings) return;
    const navs = [...(settings.headerNav || [])];
    const currentIndex = navs.findIndex((n) => n.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= navs.length) return;

    // Swap order
    const currentOrder = navs[currentIndex].order;
    const targetOrder = navs[targetIndex].order;

    navs[currentIndex].order = targetOrder;
    navs[targetIndex].order = currentOrder;

    navs.sort((a, b) => a.order - b.order);

    const updatedSettings = { ...settings, headerNav: navs };
    setSettings(updatedSettings);
    await handleSaveSettings(updatedSettings);
  };

  const handleDeleteNavItem = async (item: NavItem) => {
    if (!settings) return;
    if (!confirm(`Remove menu item "${item.label}"?`)) return;

    const updatedNav = (settings.headerNav || []).filter((n) => n.id !== item.id);
    const updatedSettings = { ...settings, headerNav: updatedNav };
    setSettings(updatedSettings);
    await handleSaveSettings(updatedSettings);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  if (loading || !settings) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
        <p className="text-xs uppercase tracking-widest text-neutral-400">Loading Navigation &amp; Branding Config...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-red-500 font-semibold block mb-1">
            Branding &amp; Navigation
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Menu, Logo &amp; Footer Manager
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Upload custom studio logos, manage header navigation items &amp; CTA buttons, and customize footer content and contacts.
          </p>
        </div>

        <button
          onClick={() => handleSaveSettings()}
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
              <span>Save All Settings</span>
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

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab('header')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'header'
              ? 'border-red-600 text-white bg-white/[0.02]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <PanelTop className="w-4 h-4 text-red-500" />
          <span>Brand Logo &amp; Header Navigation</span>
        </button>

        <button
          onClick={() => setActiveTab('footer')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'footer'
              ? 'border-red-600 text-white bg-white/[0.02]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <MenuIcon className="w-4 h-4 text-neutral-400" />
          <span>Footer Content &amp; Socials</span>
        </button>
      </div>

      {/* TAB 1: LOGO & HEADER NAVIGATION */}
      {activeTab === 'header' && (
        <div className="space-y-8">
          {/* Brand Logo Upload Section */}
          <div className="p-6 bg-[#0e0e14] border border-white/5 rounded-sm space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="font-editorial text-xl font-bold text-white flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5 text-red-500" />
                  <span>Studio Brand Logo</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Upload an image logo (PNG, SVG, WEBP) to appear in the header and footer, or customize the signature typographic mark.
                </p>
              </div>

              {uploadingLogo && (
                <span className="text-xs text-red-400 flex items-center space-x-1 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Upload Controls & Sizing */}
              <div className="lg:col-span-7 space-y-5">
                {/* File Upload Dropzone */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/png,image/svg+xml,image/webp,image/jpeg,image/gif"
                    className="hidden"
                    id="logo-file-upload"
                  />
                  <label
                    htmlFor="logo-file-upload"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLogoUpload(e);
                    }}
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/15 hover:border-red-500 rounded bg-[#14141b] hover:bg-white/[0.02] cursor-pointer transition-colors text-center group"
                  >
                    <Upload className="w-6 h-6 text-neutral-400 group-hover:text-red-500 mb-2 transition-colors" />
                    <span className="text-xs text-white font-medium">Click or Drag &amp; Drop Brand Logo Here</span>
                    <span className="text-[10px] text-neutral-500 mt-1">PNG with transparent background, SVG, WEBP, or JPEG (Max 10MB)</span>
                  </label>
                </div>

                {/* Direct URL input */}
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-400 text-xs font-medium">
                    Or Direct Logo Image URL / Relative Path
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={settings.logoUrl || ''}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      placeholder="https://... or /uploads/logo.png"
                      className="w-full bg-[#14141b] border border-white/10 pl-9 pr-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {/* Logo Height Adjustment */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="uppercase tracking-wider text-neutral-400 font-medium">
                      Display Logo Height
                    </label>
                    <span className="font-mono text-white text-xs font-bold">
                      {settings.logoHeight || 36}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="64"
                    step="2"
                    value={settings.logoHeight || 36}
                    onChange={(e) => setSettings({ ...settings, logoHeight: parseInt(e.target.value) || 36 })}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>20px (Compact)</span>
                    <span>36px (Recommended)</span>
                    <span>64px (Prominent)</span>
                  </div>
                </div>

                {/* Typographic fallback details */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="block uppercase tracking-wider text-neutral-400 text-[10px] font-medium">
                      Typographic Brand Text
                    </label>
                    <input
                      type="text"
                      value={settings.logoText || 'REDD'}
                      onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                      placeholder="REDD"
                      className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block uppercase tracking-wider text-neutral-400 text-[10px] font-medium">
                      Logo Tagline / Subtitle
                    </label>
                    <input
                      type="text"
                      value={settings.logoSubtitle || 'Photography Creations'}
                      onChange={(e) => setSettings({ ...settings, logoSubtitle: e.target.value })}
                      placeholder="Photography Creations"
                      className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Live Logo Previews */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[10px] uppercase font-mono text-neutral-500 block">
                  Live Logo Presentation Preview:
                </span>

                {/* Dark Background Preview */}
                <div className="p-6 rounded bg-[#08080a] border border-white/10 space-y-3">
                  <span className="text-[9px] uppercase font-mono text-neutral-500 block">
                    Header Dark Background Preview:
                  </span>
                  <div className="flex items-center space-x-3 py-2">
                    {settings.logoUrl ? (
                      <img
                        src={settings.logoUrl}
                        alt="Logo Preview"
                        style={{ height: `${settings.logoHeight || 36}px` }}
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 text-left">
                        <div className="relative">
                          <span className="font-editorial text-2xl font-bold tracking-tight text-white">
                            {settings.logoText || 'REDD'}
                          </span>
                          <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                        </div>
                        <div className="border-l border-white/20 pl-3">
                          <span className="block text-[8px] uppercase tracking-[0.3em] text-neutral-400 font-light">
                            {settings.logoSubtitle ? settings.logoSubtitle.split(' ')[0] : 'Photography'}
                          </span>
                          <span className="block text-[8px] uppercase tracking-[0.3em] text-neutral-400 font-light">
                            {settings.logoSubtitle ? settings.logoSubtitle.split(' ').slice(1).join(' ') : 'Creations'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {settings.logoUrl && (
                    <div className="pt-2 border-t border-white/10 flex justify-end">
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
                      >
                        Remove Logo (Revert to Typographic Wordmark)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Header Navigation Links Manager */}
          <div className="p-6 bg-[#0e0e14] border border-white/5 rounded-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h3 className="font-editorial text-xl font-bold text-white flex items-center space-x-2">
                  <Compass className="w-5 h-5 text-red-500" />
                  <span>Header Navigation Links</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Reorder, add custom links, or toggle visibility for menu items appearing in the desktop navbar and mobile drawer.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddNavModal}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Menu Item</span>
              </button>
            </div>

            {/* Menu Items List */}
            <div className="divide-y divide-white/5 border border-white/5 rounded-sm overflow-hidden bg-black/20">
              {(settings.headerNav || []).map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    item.enabled ? 'hover:bg-white/[0.02]' : 'bg-neutral-950/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-xs text-neutral-500 w-6">#{item.order}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-editorial text-lg tracking-wider font-semibold">
                          {item.label}
                        </span>
                        {item.isExternal && (
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">
                            External
                          </span>
                        )}
                        <span
                          className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold border ${
                            item.enabled
                              ? 'bg-green-950/60 border-green-700/50 text-green-400'
                              : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                          }`}
                        >
                          {item.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-neutral-400">{item.href}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Enable / Disable Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleNavEnabled(item)}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                        item.enabled
                          ? 'bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-600/40'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                      }`}
                      title={item.enabled ? 'Click to Disable' : 'Click to Enable'}
                    >
                      <Power className={`w-3.5 h-3.5 ${item.enabled ? 'text-green-400' : 'text-neutral-500'}`} />
                      <span>{item.enabled ? 'Active' : 'Hidden'}</span>
                    </button>

                    {/* Move Up */}
                    <button
                      type="button"
                      onClick={() => handleReorderNav(item, 'up')}
                      disabled={index === 0}
                      className="p-2 text-neutral-400 hover:text-white disabled:opacity-20 disabled:hover:text-neutral-400 bg-white/5 hover:bg-white/10 rounded transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      onClick={() => handleReorderNav(item, 'down')}
                      disabled={index === (settings.headerNav?.length || 0) - 1}
                      className="p-2 text-neutral-400 hover:text-white disabled:opacity-20 disabled:hover:text-neutral-400 bg-white/5 hover:bg-white/10 rounded transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => openEditNavModal(item)}
                      className="p-2 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
                      title="Edit Nav Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteNavItem(item)}
                      className="p-2 text-neutral-500 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded transition-colors"
                      title="Delete Nav Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Header Action (CTA) Button Settings */}
            <div className="pt-6 border-t border-white/5 space-y-4">
              <h4 className="text-white text-sm font-semibold">
                Header Action (CTA) Button
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block uppercase tracking-wider text-neutral-400 text-xs font-medium">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={settings.headerCtaText || 'Book Session'}
                    onChange={(e) => setSettings({ ...settings, headerCtaText: e.target.value })}
                    className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block uppercase tracking-wider text-neutral-400 text-xs font-medium">
                    Button Destination Link
                  </label>
                  <input
                    type="text"
                    value={settings.headerCtaLink || '/contact'}
                    onChange={(e) => setSettings({ ...settings, headerCtaLink: e.target.value })}
                    className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white text-xs font-mono"
                  />
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.headerCtaEnabled ?? true}
                      onChange={(e) => setSettings({ ...settings, headerCtaEnabled: e.target.checked })}
                      className="w-4 h-4 accent-red-600"
                    />
                    <span className="text-xs text-white">Show CTA Button in Header</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FOOTER CONTENT & SOCIALS */}
      {activeTab === 'footer' && (
        <div className="space-y-8">
          <div className="p-6 bg-[#0e0e14] border border-white/5 rounded-sm space-y-6">
            <h3 className="font-editorial text-xl font-bold text-white border-b border-white/5 pb-3">
              Footer Editorial Content &amp; Contacts
            </h3>

            {/* Brand Column Narrative & Headquarters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-neutral-300 text-xs font-medium">
                  Footer Brand Bio Statement
                </label>
                <textarea
                  rows={4}
                  value={settings.footerBio || settings.bio || ''}
                  onChange={(e) => setSettings({ ...settings, footerBio: e.target.value })}
                  placeholder="Summary text rendered in the first column of the footer..."
                  className="w-full bg-[#14141b] border border-white/10 p-3 text-white text-xs leading-relaxed focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-300 text-xs font-medium">
                    Studio Headquarters Location
                  </label>
                  <input
                    type="text"
                    value={settings.footerHeadquarters || settings.location || ''}
                    onChange={(e) => setSettings({ ...settings, footerHeadquarters: e.target.value })}
                    placeholder="New York • Paris • Milan • Worldwide"
                    className="w-full bg-[#14141b] border border-white/10 p-2.5 text-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-300 text-xs font-medium">
                    Copyright Notice ({'{year}'} will be replaced automatically)
                  </label>
                  <input
                    type="text"
                    value={settings.footerCopyright || '© {year} REDD Photography Creations. All photographic rights reserved.'}
                    onChange={(e) => setSettings({ ...settings, footerCopyright: e.target.value })}
                    placeholder="© {year} REDD Photography Creations..."
                    className="w-full bg-[#14141b] border border-white/10 p-2.5 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Inquiries Column Settings */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <h4 className="text-white text-sm font-semibold">
                Footer Inquiries &amp; Booking Column
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-400 text-xs font-medium">
                    Column Title
                  </label>
                  <input
                    type="text"
                    value={settings.footerInquiriesTitle || 'Inquiries & Bookings'}
                    onChange={(e) => setSettings({ ...settings, footerInquiriesTitle: e.target.value })}
                    className="w-full bg-[#14141b] border border-white/10 p-2.5 text-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-400 text-xs font-medium">
                    Inquiry Narrative Description
                  </label>
                  <input
                    type="text"
                    value={settings.footerInquiriesText || 'Accepting select editorial commissions and commercial productions globally.'}
                    onChange={(e) => setSettings({ ...settings, footerInquiriesText: e.target.value })}
                    className="w-full bg-[#14141b] border border-white/10 p-2.5 text-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-400 text-xs font-medium">
                    Footer Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.footerInquiriesEmail || settings.email}
                    onChange={(e) => setSettings({ ...settings, footerInquiriesEmail: e.target.value })}
                    className="w-full bg-[#14141b] border border-white/10 p-2.5 text-white text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-400 text-xs font-medium">
                    Footer Contact Phone
                  </label>
                  <input
                    type="text"
                    value={settings.footerInquiriesPhone || settings.phone}
                    onChange={(e) => setSettings({ ...settings, footerInquiriesPhone: e.target.value })}
                    className="w-full bg-[#14141b] border border-white/10 p-2.5 text-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-400 text-xs font-medium">
                    Proposal Button Label
                  </label>
                  <input
                    type="text"
                    value={settings.footerCtaText || 'Request Booking Proposal'}
                    onChange={(e) => setSettings({ ...settings, footerCtaText: e.target.value })}
                    className="w-full bg-[#14141b] border border-white/10 p-2.5 text-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-400 text-xs font-medium">
                    Proposal Button Link
                  </label>
                  <input
                    type="text"
                    value={settings.footerCtaLink || '/contact'}
                    onChange={(e) => setSettings({ ...settings, footerCtaLink: e.target.value })}
                    className="w-full bg-[#14141b] border border-white/10 p-2.5 text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Social Channels */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <h4 className="text-white text-sm font-semibold">
                Social Media Channels
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block uppercase tracking-wider text-neutral-400 text-[10px] font-medium">
                    Instagram URL
                  </label>
                  <input
                    type="text"
                    value={settings.socials.instagram || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socials: { ...settings.socials, instagram: e.target.value },
                      })
                    }
                    placeholder="https://instagram.com/..."
                    className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block uppercase tracking-wider text-neutral-400 text-[10px] font-medium">
                    Behance URL
                  </label>
                  <input
                    type="text"
                    value={settings.socials.behance || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socials: { ...settings.socials, behance: e.target.value },
                      })
                    }
                    placeholder="https://behance.net/..."
                    className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block uppercase tracking-wider text-neutral-400 text-[10px] font-medium">
                    Vimeo URL
                  </label>
                  <input
                    type="text"
                    value={settings.socials.vimeo || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socials: { ...settings.socials, vimeo: e.target.value },
                      })
                    }
                    placeholder="https://vimeo.com/..."
                    className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block uppercase tracking-wider text-neutral-400 text-[10px] font-medium">
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={settings.socials.linkedin || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socials: { ...settings.socials, linkedin: e.target.value },
                      })
                    }
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block uppercase tracking-wider text-neutral-400 text-[10px] font-medium">
                    Twitter / X URL
                  </label>
                  <input
                    type="text"
                    value={settings.socials.twitter || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socials: { ...settings.socials, twitter: e.target.value },
                      })
                    }
                    placeholder="https://twitter.com/..."
                    className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Admin Link Visibility Toggle */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="block text-white text-xs font-medium">Show Admin Portal Link in Footer</span>
                <span className="text-[10px] text-neutral-500">
                  Renders a discreet lock icon link in the bottom footer bar for quick CMS access.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showAdminInFooter ?? true}
                onChange={(e) => setSettings({ ...settings, showAdminInFooter: e.target.checked })}
                className="w-4 h-4 accent-red-600"
              />
            </div>

            {/* Dedicated Save Footer Settings Button */}
            <div className="pt-6 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={saving}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Footer...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Footer Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT NAV ITEM */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0e0e14] border border-white/10 rounded-sm max-w-lg w-full p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-red-500 font-semibold block">
                  {isEditingNav ? 'Modify Menu Link' : 'New Navigation Item'}
                </span>
                <h2 className="font-editorial text-2xl font-bold text-white">
                  {isEditingNav ? 'Edit Menu Item' : 'Add Menu Item'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNavItem} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                  Menu Item Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={navForm.label}
                  onChange={(e) => setNavForm({ ...navForm, label: e.target.value })}
                  placeholder="e.g. JOURNAL, EXHIBITIONS, WORK"
                  className="w-full bg-[#14141b] border border-white/10 px-3 py-2.5 text-white uppercase focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                  Destination URL / Link Path <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={navForm.href}
                  onChange={(e) => setNavForm({ ...navForm, href: e.target.value })}
                  placeholder="e.g. /#work, /about, /services, or https://..."
                  className="w-full bg-[#14141b] border border-white/10 px-3 py-2.5 text-white font-mono focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={navForm.order}
                    onChange={(e) =>
                      setNavForm({ ...navForm, order: parseInt(e.target.value) || 1 })
                    }
                    className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={navForm.isExternal}
                      onChange={(e) => setNavForm({ ...navForm, isExternal: e.target.checked })}
                      className="w-4 h-4 accent-red-600"
                    />
                    <span className="text-white">Open in New Tab</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={navForm.enabled}
                      onChange={(e) => setNavForm({ ...navForm, enabled: e.target.checked })}
                      className="w-4 h-4 accent-red-600"
                    />
                    <span className="text-white">Active / Visible</span>
                  </label>
                </div>
              </div>

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
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold uppercase tracking-wider text-xs rounded flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditingNav ? 'Save Changes' : 'Add Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
