'use client';

import React, { useState, useEffect } from 'react';
import { SiteSettings } from '@/lib/types';
import { Save, Lock, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Camera, Sparkles } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error('Error fetching settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSavingSettings(true);
    setSettingsSuccess(false);
    setSettingsError(null);

    try {
      let res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settingsUpdates: settings }),
      });

      if (res.status === 405) {
        res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settingsUpdates: settings }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      try {
        localStorage.setItem('redd_site_settings', JSON.stringify(data.settings || settings));
        window.dispatchEvent(new Event('redd_settings_updated'));
        window.dispatchEvent(new CustomEvent('redd_data_updated', { detail: { type: 'settings', data: data.settings || settings } }));
      } catch {}

      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSettingsError(err.message);
      } else {
        setSettingsError('An error occurred');
      }
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(false);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    setChangingPassword(true);

    try {
      let res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passwordChange: {
            currentPassword,
            newPassword,
          },
        }),
      });

      if (res.status === 405) {
        res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            passwordChange: {
              currentPassword,
              newPassword,
            },
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPasswordError(err.message);
      } else {
        setPasswordError('Failed to change password');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
        <p className="text-xs uppercase tracking-widest text-neutral-400">Loading Studio Configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <span className="text-xs uppercase tracking-[0.25em] text-red-500 font-semibold block mb-1">
          System Preferences
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Studio Settings & Profile
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Configure branding, artist biography, production optics, and administrator security.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-8">
        {settingsSuccess && (
          <div className="p-4 bg-green-950/40 border border-green-800/60 rounded flex items-center space-x-3 text-green-300 text-xs animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Studio profile and public configuration successfully saved!</span>
          </div>
        )}

        {settingsError && (
          <div className="p-4 bg-red-950/40 border border-red-800/60 rounded flex items-center space-x-3 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{settingsError}</span>
          </div>
        )}

        {/* Section: Brand & Artist Identity */}
        <div className="bg-[#0e0e14] border border-white/5 rounded-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/10 text-white">
            <Sparkles className="w-4 h-4 text-red-500" />
            <h3 className="font-editorial text-xl font-bold">Studio Identity & Contact</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                Brand Name
              </label>
              <input
                type="text"
                value={settings.brandName}
                onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                className="w-full bg-[#14141b] border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                Lead Artist / Director Name
              </label>
              <input
                type="text"
                value={settings.artistName}
                onChange={(e) => setSettings({ ...settings, artistName: e.target.value })}
                className="w-full bg-[#14141b] border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                Public Studio Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-[#14141b] border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                Studio Phone / WhatsApp
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full bg-[#14141b] border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                Geographic Presence & Studios
              </label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                className="w-full bg-[#14141b] border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>
        </div>

        {/* Section: Typography, Hero & Bio */}
        <div className="bg-[#0e0e14] border border-white/5 rounded-sm p-6 md:p-8 space-y-6">
          <div className="pb-3 border-b border-white/10 text-white">
            <h3 className="font-editorial text-xl font-bold">Hero Copy & Curatorial Statement</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                Hero Headline Statement
              </label>
              <input
                type="text"
                value={settings.heroTagline}
                onChange={(e) => setSettings({ ...settings, heroTagline: e.target.value })}
                className="w-full bg-[#14141b] border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                Hero Subtitle
              </label>
              <input
                type="text"
                value={settings.heroSubtitle}
                onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                className="w-full bg-[#14141b] border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                Photographer Full Biography
              </label>
              <textarea
                rows={4}
                value={settings.bio}
                onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                className="w-full bg-[#14141b] border border-white/10 p-3 text-white focus:outline-none focus:border-red-600 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                  Years Direction
                </label>
                <input
                  type="number"
                  value={settings.yearsExperience}
                  onChange={(e) =>
                    setSettings({ ...settings, yearsExperience: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                  Solo Exhibitions
                </label>
                <input
                  type="number"
                  value={settings.exhibitionsCount}
                  onChange={(e) =>
                    setSettings({ ...settings, exhibitionsCount: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                  Honors & Awards
                </label>
                <input
                  type="number"
                  value={settings.awardsCount}
                  onChange={(e) =>
                    setSettings({ ...settings, awardsCount: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Gear Kit */}
        <div className="bg-[#0e0e14] border border-white/5 rounded-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/10 text-white">
            <Camera className="w-4 h-4 text-red-500" />
            <h3 className="font-editorial text-xl font-bold">Studio Gear Arsenal</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                Camera Bodies (comma-separated)
              </label>
              <textarea
                rows={3}
                value={settings.gearKit.cameras.join(', ')}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    gearKit: {
                      ...settings.gearKit,
                      cameras: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    },
                  })
                }
                className="w-full bg-[#14141b] border border-white/10 p-2.5 text-white font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                Prime Optics (comma-separated)
              </label>
              <textarea
                rows={3}
                value={settings.gearKit.lenses.join(', ')}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    gearKit: {
                      ...settings.gearKit,
                      lenses: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    },
                  })
                }
                className="w-full bg-[#14141b] border border-white/10 p-2.5 text-white font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                Lighting Rigs (comma-separated)
              </label>
              <textarea
                rows={3}
                value={settings.gearKit.lighting.join(', ')}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    gearKit: {
                      ...settings.gearKit,
                      lighting: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    },
                  })
                }
                className="w-full bg-[#14141b] border border-white/10 p-2.5 text-white font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Section: Social Profiles */}
        <div className="bg-[#0e0e14] border border-white/5 rounded-sm p-6 md:p-8 space-y-6">
          <div className="pb-3 border-b border-white/10 text-white">
            <h3 className="font-editorial text-xl font-bold">Social Media Profiles</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                Instagram URL
              </label>
              <input
                type="text"
                value={settings.socials.instagram}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socials: { ...settings.socials, instagram: e.target.value },
                  })
                }
                className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider text-neutral-400 font-medium">
                Behance Portfolio URL
              </label>
              <input
                type="text"
                value={settings.socials.behance}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socials: { ...settings.socials, behance: e.target.value },
                  })
                }
                className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingSettings}
            className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-[0.2em] font-semibold rounded transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {savingSettings ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Security: Change Master Password Form */}
      <div className="bg-[#0e0e14] border border-red-900/30 rounded-sm p-6 md:p-8 space-y-6 pt-8">
        <div className="flex items-center space-x-2 pb-3 border-b border-white/10 text-white">
          <ShieldCheck className="w-5 h-5 text-red-500" />
          <div>
            <h3 className="font-editorial text-xl font-bold">Admin Security & Password</h3>
            <p className="text-xs text-neutral-400">
              Account bound to: <span className="text-white font-mono">reddphotographycreations@gmail.com</span>
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="p-4 bg-green-950/40 border border-green-800/60 rounded flex items-center space-x-3 text-green-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Master administrator password changed successfully!</span>
          </div>
        )}

        {passwordError && (
          <div className="p-4 bg-red-950/40 border border-red-800/60 rounded flex items-center space-x-3 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 text-xs max-w-lg">
          <div className="space-y-1.5">
            <label className="block uppercase tracking-wider text-neutral-400 font-medium">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block uppercase tracking-wider text-neutral-400 font-medium">
              New Password (min 8 characters)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block uppercase tracking-wider text-neutral-400 font-medium">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#14141b] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-wider font-semibold rounded flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            {changingPassword ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-red-500" />
            )}
            <span>Update Master Password</span>
          </button>
        </form>
      </div>
    </div>
  );
}
