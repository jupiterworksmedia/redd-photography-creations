'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AboutPageSettings, SiteSettings, CategoryItem } from '@/lib/types';
import { ArrowUpRight, Camera, Award, Sparkles, CheckCircle } from 'lucide-react';

interface AboutClientProps {
  initialAbout: AboutPageSettings;
  settings: SiteSettings;
  categories: CategoryItem[];
}

export default function AboutClient({
  initialAbout,
  settings: initialSettings,
  categories: initialCategories = [],
}: AboutClientProps) {
  const [about, setAbout] = useState<AboutPageSettings>(initialAbout);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);

  // Sync with localStorage and live background updates
  useEffect(() => {
    // 1. Hydrate from server props
    if (initialAbout) setAbout(initialAbout);
    if (initialSettings) setSettings(initialSettings);
    if (initialCategories.length > 0) setCategories(initialCategories);

    // 2. Instant 0ms hydration from local cache
    try {
      const storedAbout = localStorage.getItem('redd_about_data');
      if (storedAbout) {
        const parsed = JSON.parse(storedAbout);
        if (parsed) setAbout(parsed);
      }
      const storedSettings = localStorage.getItem('redd_site_settings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed) setSettings(parsed);
      }
    } catch {}

    // 3. Fresh network fetch
    fetch('/api/about', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d.about) {
          setAbout(d.about);
          try {
            localStorage.setItem('redd_about_data', JSON.stringify(d.about));
          } catch {}
        }
      })
      .catch(() => {});

    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          setSettings(d.settings);
          try {
            localStorage.setItem('redd_site_settings', JSON.stringify(d.settings));
          } catch {}
        }
      })
      .catch(() => {});

    // 4. Real-time event and cross-tab listener
    const handleUpdate = () => {
      try {
        const storedAbout = localStorage.getItem('redd_about_data');
        if (storedAbout) setAbout(JSON.parse(storedAbout));
        const storedSettings = localStorage.getItem('redd_site_settings');
        if (storedSettings) setSettings(JSON.parse(storedSettings));
      } catch {}
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('redd_data_updated', handleUpdate as EventListener);
    window.addEventListener('redd_settings_updated', handleUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('redd_data_updated', handleUpdate as EventListener);
      window.removeEventListener('redd_settings_updated', handleUpdate as EventListener);
    };
  }, [initialAbout, initialSettings, initialCategories]);

  // Helper to render headline with italic accent
  const renderHeadline = () => {
    if (
      !about.headlineItalic ||
      !about.headline.toLowerCase().includes(about.headlineItalic.toLowerCase())
    ) {
      return about.headline;
    }
    const idx = about.headline.toLowerCase().indexOf(about.headlineItalic.toLowerCase());
    const before = about.headline.substring(0, idx);
    const match = about.headline.substring(idx, idx + about.headlineItalic.length);
    const after = about.headline.substring(idx + about.headlineItalic.length);

    return (
      <>
        {before}
        <span className="italic text-neutral-300">{match}</span>
        {after}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-[#f3f3f5]">
      <Navbar settings={settings} />

      <main className="pt-36 pb-24">
        {/* Header Title */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-20">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-8 h-[1px] bg-red-600"></span>
            <span className="text-[11px] uppercase tracking-[0.35em] text-neutral-400 font-medium">
              {about.eyebrow || 'About The Director & Studio'}
            </span>
          </div>
          <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl font-light text-white uppercase leading-[0.95] max-w-5xl">
            {renderHeadline()}
          </h1>
        </section>

        {/* Artist Biography & Studio Vision */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 mb-28">
          {/* Portrait Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#101015] border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  about.portraitImageUrl ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop'
                }
                alt={`${about.directorName || settings.artistName} - Director of REDD Photography Creations`}
                className="w-full h-full object-cover filter grayscale contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] uppercase tracking-[0.25em] text-red-500 font-semibold block">
                  {about.directorRole || 'Creative Director'}
                </span>
                <h3 className="font-editorial text-2xl text-white font-medium">
                  {about.directorName || settings.artistName}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {about.directorSubRole || 'Founding Principal, REDD Studio'}
                </p>
              </div>
            </div>
          </div>

          {/* Philosophy Prose */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
            <div className="space-y-5 text-neutral-300 text-base md:text-lg font-light leading-relaxed">
              <p>{about.bioParagraph1 || settings.bio}</p>
              {about.bioQuote && (
                <p>
                  &ldquo;{about.bioQuote.replace(/^["“]|["”]$/g, '')}&rdquo;
                </p>
              )}
              {about.bioParagraph2 && (
                <p className="text-sm text-neutral-400">{about.bioParagraph2}</p>
              )}
            </div>

            {/* Milestones */}
            {about.milestones && about.milestones.length > 0 && (
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                {about.milestones.map((mile) => (
                  <div key={mile.id}>
                    <span className="font-editorial text-4xl sm:text-5xl font-bold text-white block">
                      {mile.value}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                      {mile.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Selected Publications & Honors */}
        {about.honorsList && about.honorsList.length > 0 && (
          <section className="px-6 md:px-12 max-w-7xl mx-auto mb-28 py-16 bg-[#0c0c10] border-y border-white/5">
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="text-center space-y-2">
                <span className="text-xs uppercase tracking-[0.35em] text-red-500 font-semibold">
                  {about.honorsEyebrow || 'Recognition'}
                </span>
                <h2 className="font-editorial text-4xl text-white uppercase font-light">
                  {about.honorsTitle || 'Features & Honors'}
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center pt-6">
                {about.honorsList.map((hon) => (
                  <div key={hon.id} className="p-6 border border-white/5 bg-black/40 rounded-sm">
                    <span className="font-editorial text-2xl text-white block mb-1">
                      {hon.title}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                      {hon.subtitle}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Technical Gear Arsenal */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-24">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.35em] text-red-500 font-semibold block mb-2">
              {about.gearTitleEyebrow || 'The Optical Arsenal'}
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-light text-white uppercase">
              {about.gearTitle || 'Curated Production Gear'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#101016] border border-white/5 rounded-sm space-y-4">
              <div className="flex items-center space-x-3 text-red-500">
                <Camera className="w-5 h-5" />
                <h3 className="text-white text-sm font-semibold uppercase tracking-wider">
                  Camera Systems
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-neutral-300 font-mono">
                {settings.gearKit.cameras.map((cam, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    <span>{cam}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 bg-[#101016] border border-white/5 rounded-sm space-y-4">
              <div className="flex items-center space-x-3 text-red-500">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-white text-sm font-semibold uppercase tracking-wider">
                  Prime Optics
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-neutral-300 font-mono">
                {settings.gearKit.lenses.map((lens, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    <span>{lens}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 bg-[#101016] border border-white/5 rounded-sm space-y-4">
              <div className="flex items-center space-x-3 text-red-500">
                <Award className="w-5 h-5" />
                <h3 className="text-white text-sm font-semibold uppercase tracking-wider">
                  Lighting Modifiers
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-neutral-300 font-mono">
                {settings.gearKit.lighting.map((light, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    <span>{light}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA to Book */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto text-center py-16 border-t border-white/10">
          <h3 className="font-editorial text-4xl text-white font-light mb-4">
            {about.ctaTitle || 'Commission a Visual Narrative'}
          </h3>
          <p className="text-neutral-400 text-sm max-w-lg mx-auto mb-8 font-light">
            {about.ctaDescription ||
              'Available for private sessions, high-fashion campaigns, and commercial briefs globally.'}
          </p>
          <Link
            href={about.ctaButtonLink || '/contact'}
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.25em] font-semibold text-black bg-white hover:bg-neutral-200 px-8 py-4 transition-colors"
          >
            <span>{about.ctaButtonText || 'Request Shoot Consultation'}</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
