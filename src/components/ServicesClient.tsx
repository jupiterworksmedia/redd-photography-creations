'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ServicesPageSettings, SiteSettings, CategoryItem } from '@/lib/types';
import { ArrowUpRight, Check } from 'lucide-react';

interface ServicesClientProps {
  initialServices: ServicesPageSettings;
  settings: SiteSettings;
  categories: CategoryItem[];
}

export default function ServicesClient({
  initialServices,
  settings: initialSettings,
  categories: initialCategories = [],
}: ServicesClientProps) {
  const [services, setServices] = useState<ServicesPageSettings>(initialServices);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);

  // Sync with localStorage and live background updates
  useEffect(() => {
    // 1. Hydrate from server props
    if (initialServices) setServices(initialServices);
    if (initialSettings) setSettings(initialSettings);
    if (initialCategories.length > 0) setCategories(initialCategories);

    // 2. Instant 0ms hydration from local cache
    try {
      const storedServices = localStorage.getItem('redd_services_data');
      if (storedServices) {
        const parsed = JSON.parse(storedServices);
        if (parsed) setServices(parsed);
      }
      const storedSettings = localStorage.getItem('redd_site_settings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed) setSettings(parsed);
      }
    } catch {}

    // 3. Fresh network fetch
    fetch('/api/services', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d.services) {
          setServices(d.services);
          try {
            localStorage.setItem('redd_services_data', JSON.stringify(d.services));
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
        const storedServices = localStorage.getItem('redd_services_data');
        if (storedServices) setServices(JSON.parse(storedServices));
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
  }, [initialServices, initialSettings, initialCategories]);

  // Helper to render headline with italic accent
  const renderHeadline = () => {
    if (
      !services.headlineItalic ||
      !services.headline.toLowerCase().includes(services.headlineItalic.toLowerCase())
    ) {
      return services.headline;
    }
    const idx = services.headline.toLowerCase().indexOf(services.headlineItalic.toLowerCase());
    const before = services.headline.substring(0, idx);
    const match = services.headline.substring(idx, idx + services.headlineItalic.length);
    const after = services.headline.substring(idx + services.headlineItalic.length);

    return (
      <>
        {before}
        <span className="italic text-neutral-300">{match}</span>
        {after}
      </>
    );
  };

  const visibleOfferings = (services.offerings || [])
    .filter((o) => o.enabled !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-[#08080a] text-[#f3f3f5]">
      <Navbar settings={settings} />

      <main className="pt-36 pb-24">
        {/* Header */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-20">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-8 h-[1px] bg-red-600"></span>
            <span className="text-[11px] uppercase tracking-[0.35em] text-neutral-400 font-medium">
              {services.eyebrow || 'Bespoke Production Services'}
            </span>
          </div>
          <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl font-light text-white uppercase leading-[0.95] max-w-5xl">
            {renderHeadline()}
          </h1>
          {services.introText && (
            <p className="text-neutral-400 text-base md:text-lg max-w-2xl mt-6 font-light leading-relaxed">
              {services.introText}
            </p>
          )}
        </section>

        {/* Services List */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto space-y-12 mb-28">
          {visibleOfferings.map((service, index) => (
            <div
              key={service.id || service.category}
              className="p-8 md:p-12 bg-[#0d0d12] border border-white/5 rounded-sm hover:border-white/20 transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono text-neutral-600">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs uppercase tracking-[0.25em] text-red-500 font-semibold">
                      {service.eyebrow}
                    </span>
                  </div>
                  <h2 className="font-editorial text-3xl sm:text-4xl text-white font-medium">
                    {service.title}
                  </h2>
                  <p className="text-neutral-300 text-sm md:text-base leading-relaxed font-light">
                    {service.description}
                  </p>

                  {service.features && service.features.length > 0 && (
                    <div className="pt-4">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 block mb-3 font-semibold">
                        Included Production Elements:
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {service.features.map((feat, i) => (
                          <li key={i} className="flex items-start space-x-2 text-xs text-neutral-300">
                            <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6 lg:pl-8 lg:border-l lg:border-white/5">
                  <div className="space-y-4 bg-black/40 p-6 rounded border border-white/5">
                    {service.idealFor && (
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 block mb-1">
                          Ideal Clientele
                        </span>
                        <p className="text-xs text-neutral-300 leading-relaxed">{service.idealFor}</p>
                      </div>
                    )}

                    {service.investment && (
                      <div className="pt-3 border-t border-white/5">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 block mb-1">
                          Starting Investment
                        </span>
                        <span className="font-editorial text-2xl text-white font-semibold">
                          {service.investment}
                        </span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={service.buttonLink || `/contact?category=${service.category}`}
                    className="w-full inline-flex items-center justify-center space-x-2 py-3.5 bg-white text-black hover:bg-neutral-200 text-xs uppercase tracking-[0.2em] font-semibold transition-colors"
                  >
                    <span>{service.buttonText || 'Inquire About This Service'}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* The Production Journey */}
        {services.journeySteps && services.journeySteps.length > 0 && (
          <section className="px-6 md:px-12 max-w-7xl mx-auto mb-24 py-16 bg-[#0c0c10] border-y border-white/5">
            <div className="mb-12 text-center max-w-2xl mx-auto">
              <span className="text-xs uppercase tracking-[0.35em] text-red-500 font-semibold block mb-2">
                {services.journeyEyebrow || 'The Experience'}
              </span>
              <h2 className="font-editorial text-4xl text-white uppercase font-light">
                {services.journeyTitle || 'From Concept to Master Print'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {services.journeySteps.map((step) => (
                <div key={step.id || step.stepNumber} className="p-6 border border-white/5 bg-black/30 space-y-3">
                  <span className="text-xs font-mono text-red-500 block">{step.stepNumber}</span>
                  <h3 className="text-white text-base font-medium">{step.title}</h3>
                  <p className="text-neutral-400 text-xs leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Optional Bottom CTA */}
        {services.ctaTitle && (
          <section className="px-6 md:px-12 max-w-7xl mx-auto text-center py-16 border-t border-white/10">
            <h3 className="font-editorial text-4xl text-white font-light mb-4">
              {services.ctaTitle}
            </h3>
            {services.ctaDescription && (
              <p className="text-neutral-400 text-sm max-w-lg mx-auto mb-8 font-light">
                {services.ctaDescription}
              </p>
            )}
            <Link
              href={services.ctaButtonLink || '/contact'}
              className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.25em] font-semibold text-black bg-white hover:bg-neutral-200 px-8 py-4 transition-colors"
            >
              <span>{services.ctaButtonText || 'Initiate Booking Proposal'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </section>
        )}
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
