'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Instagram, Lock, ArrowUpRight } from 'lucide-react';
import { SiteSettings, CategoryItem } from '@/lib/types';

interface FooterProps {
  settings?: SiteSettings;
  categories?: CategoryItem[];
}

export default function Footer({ settings: initialSettings, categories: initialCategories = [] }: FooterProps) {
  const [settings, setSettings] = useState<SiteSettings | undefined>(initialSettings);
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);

  // Sync settings and categories with localStorage & live API
  useEffect(() => {
    if (initialSettings) setSettings(initialSettings);
    if (initialCategories && initialCategories.length > 0) setCategories(initialCategories);

    // 1. Immediately read any local saved settings from admin edits
    try {
      const stored = localStorage.getItem('redd_site_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) setSettings(parsed);
      }
    } catch {}

    // 2. Fetch fresh live settings from /api/settings
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings);
          try {
            localStorage.setItem('redd_site_settings', JSON.stringify(data.settings));
          } catch {}
        }
      })
      .catch(() => {});

    // 3. Fetch fresh categories
    fetch('/api/categories', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});

    // 4. Listen for instant live updates dispatched by the admin panel
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem('redd_site_settings');
        if (stored) setSettings(JSON.parse(stored));
      } catch {}
    };

    window.addEventListener('redd_settings_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('redd_settings_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [initialSettings, initialCategories]);

  const currentYear = new Date().getFullYear().toString();

  const brandName = settings?.brandName || 'REDD Photography Creations';
  const logoUrl = settings?.logoUrl;
  const logoHeight = settings?.logoHeight || 36;
  const logoText = settings?.logoText || 'REDD';
  const logoSubtitle = settings?.logoSubtitle || 'Photography Creations';

  const bioText =
    settings?.footerBio ||
    settings?.bio ||
    'Modernist visual storytelling across haute couture, fine-art boudoir, cinematic portraits, high-society events, and brand commercial campaigns. Stripping away the excess to reveal uncompromising form and soul.';

  const headquarters = settings?.footerHeadquarters || settings?.location || 'New York • Paris • Milan • Worldwide';
  const inquiriesTitle = settings?.footerInquiriesTitle || 'Inquiries & Bookings';
  const inquiriesText =
    settings?.footerInquiriesText ||
    'Accepting select editorial commissions, bespoke boudoir sessions, and commercial brand productions globally.';

  const email = settings?.footerInquiriesEmail || settings?.email || 'reddphotographycreations@gmail.com';
  const phone = settings?.footerInquiriesPhone || settings?.phone || '+1 (555) 382-7333';
  const ctaText = settings?.footerCtaText || 'Request Booking Proposal';
  const ctaLink = settings?.footerCtaLink || '/contact';

  const copyrightTemplate =
    settings?.footerCopyright || '© {year} REDD Photography Creations. All photographic rights reserved.';
  const copyrightNotice = copyrightTemplate.replace('{year}', currentYear);

  const showAdmin = settings?.showAdminInFooter ?? true;

  // Active disciplines
  const activeDisciplines =
    categories.length > 0
      ? categories.filter((c) => c.enabled)
      : [
          { slug: 'fashion', label: 'Haute Couture & Fashion' },
          { slug: 'boudoir', label: 'Fine-Art Boudoir' },
          { slug: 'portraits', label: 'Cinematic Portraits' },
          { slug: 'events', label: 'Gala & Event Coverage' },
          { slug: 'commercial', label: 'Commercial & Campaigns' },
        ];

  const socials = settings?.socials || {
    instagram: 'https://instagram.com/reddphotographycreations',
    behance: 'https://behance.net/reddphotography',
    vimeo: 'https://vimeo.com/reddcreations',
    linkedin: 'https://linkedin.com/company/reddphotographycreations',
  };

  return (
    <footer className="bg-[#050507] border-t border-white/5 pt-20 pb-12 text-neutral-400">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/5">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-block group">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={brandName}
                  style={{ height: `${logoHeight}px` }}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="font-editorial text-3xl md:text-4xl font-bold tracking-tight text-white transition-colors group-hover:text-red-500">
                      {logoText}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  </div>
                  <span className="block text-[10px] uppercase tracking-[0.35em] text-neutral-400 font-light mt-1">
                    {logoSubtitle}
                  </span>
                </>
              )}
            </Link>

            <p className="text-neutral-400 text-sm max-w-sm leading-relaxed font-light">
              {bioText}
            </p>

            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 block mb-1 font-medium">
                Studio Headquarters
              </span>
              <p className="text-sm text-neutral-300 font-light">{headquarters}</p>
            </div>
          </div>

          {/* Disciplines Column */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] text-white font-semibold">
              Disciplines
            </h4>
            <ul className="space-y-2.5 text-sm">
              {activeDisciplines.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/#${cat.slug}`}
                    className="hover:text-white transition-colors flex items-center justify-between group"
                  >
                    <span>{cat.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-red-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Inquiries */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] text-white font-semibold">
              {inquiriesTitle}
            </h4>
            <p className="text-sm text-neutral-400 leading-relaxed font-light">
              {inquiriesText}
            </p>
            <div className="space-y-2 pt-2">
              <a
                href={`mailto:${email}`}
                className="text-white hover:text-red-500 text-sm font-medium transition-colors block underline underline-offset-4 decoration-red-600/60"
              >
                {email}
              </a>
              <p className="text-xs text-neutral-500 tracking-wider font-mono">{phone}</p>
            </div>
            <div className="pt-3">
              <Link
                href={ctaLink}
                className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded border border-white/10 transition-colors"
              >
                <span>{ctaText}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs tracking-wider text-neutral-400">
          <p>{copyrightNotice}</p>

          <div className="flex items-center space-x-6">
            {socials.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}

            {socials.behance && (
              <a
                href={socials.behance}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors text-[11px] font-mono uppercase"
              >
                Be
              </a>
            )}

            {socials.vimeo && (
              <a
                href={socials.vimeo}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors text-[11px] font-mono uppercase"
              >
                Vm
              </a>
            )}

            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors text-[11px] font-mono uppercase"
              >
                In
              </a>
            )}

            {showAdmin && (
              <>
                <span className="text-neutral-700">•</span>
                <Link
                  href="/admin/login"
                  className="inline-flex items-center space-x-1.5 text-neutral-500 hover:text-white transition-colors"
                  title="Admin CMS Portal"
                >
                  <Lock className="w-3 h-3 text-red-500" />
                  <span>Admin Login</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
