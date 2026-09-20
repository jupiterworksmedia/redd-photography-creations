'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { SiteSettings, NavItem } from '@/lib/types';

interface NavbarProps {
  settings?: SiteSettings;
}

const DEFAULT_NAV_LINKS: NavItem[] = [
  { id: 'nav-1', label: 'WORK', href: '/#work', isExternal: false, order: 1, enabled: true },
  { id: 'nav-2', label: 'ABOUT', href: '/about', isExternal: false, order: 2, enabled: true },
  { id: 'nav-3', label: 'SERVICES', href: '/services', isExternal: false, order: 3, enabled: true },
  { id: 'nav-4', label: 'CONTACT', href: '/contact', isExternal: false, order: 4, enabled: true },
];

export default function Navbar({ settings: initialSettings }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | undefined>(initialSettings);
  const pathname = usePathname();

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }

    try {
      const stored = localStorage.getItem('redd_site_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) setSettings(parsed);
      }
    } catch {}

    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch((e) => console.error('Error fetching settings for navbar:', e));

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
  }, [initialSettings]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Active navigation links sorted by order
  const navLinks: NavItem[] =
    settings?.headerNav && settings.headerNav.length > 0
      ? settings.headerNav.filter((n) => n.enabled).sort((a, b) => a.order - b.order)
      : DEFAULT_NAV_LINKS;

  const logoUrl = settings?.logoUrl;
  const logoHeight = settings?.logoHeight || 36;
  const logoText = settings?.logoText || 'REDD';
  const logoSubtitle = settings?.logoSubtitle || 'Photography Creations';

  const showCta = settings?.headerCtaEnabled ?? true;
  const ctaText = settings?.headerCtaText || 'Book Session';
  const ctaLink = settings?.headerCtaLink || '/contact';

  // Subtitle words for typographic mark
  const subtitleWords = logoSubtitle.split(' ');
  const subtitleFirst = subtitleWords[0] || 'Photography';
  const subtitleSecond = subtitleWords.slice(1).join(' ') || 'Creations';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#08080a]/90 backdrop-blur-md border-b border-white/5 py-4'
          : 'bg-transparent py-6 md:py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center space-x-3 text-left">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={settings?.brandName || 'REDD Photography Creations'}
              style={{ height: `${logoHeight}px` }}
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <span className="font-editorial text-2xl md:text-3xl font-bold tracking-tight text-white transition-colors group-hover:text-red-500">
                  {logoText}
                </span>
                <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
              </div>
              <div className="hidden sm:block border-l border-white/20 pl-3">
                <span className="block text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-light">
                  {subtitleFirst}
                </span>
                <span className="block text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-light">
                  {subtitleSecond}
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
          {navLinks.map((link) => {
            const isActive =
              link.href === pathname ||
              (link.href.startsWith('/#') && pathname === '/' && false);

            return (
              <Link
                key={link.id || link.label}
                href={link.href}
                target={link.isExternal ? '_blank' : undefined}
                rel={link.isExternal ? 'noopener noreferrer' : undefined}
                className={`text-[12px] uppercase tracking-[0.25em] font-medium transition-all duration-300 relative py-1 group ${
                  isActive ? 'text-white font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 h-[1.5px] bg-red-600 transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action (CTA) */}
        {showCta && (
          <div className="hidden md:flex items-center space-x-5">
            <Link
              href={ctaLink}
              className="inline-flex items-center space-x-2 text-[11px] uppercase tracking-[0.2em] font-semibold text-white px-5 py-2.5 rounded-full border border-white/20 hover:border-red-600 hover:bg-red-600/10 transition-all duration-300 group"
            >
              <span>{ctaText}</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-red-500 group-hover:text-white" />
            </Link>
          </div>
        )}

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-neutral-300 hover:text-white focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[70px] bg-[#08080a]/98 backdrop-blur-2xl border-t border-white/10 px-8 py-10 flex flex-col justify-between z-40 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col space-y-6">
            {navLinks.map((link, idx) => (
              <Link
                key={link.id || link.label}
                href={link.href}
                target={link.isExternal ? '_blank' : undefined}
                rel={link.isExternal ? 'noopener noreferrer' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-editorial tracking-wider text-neutral-300 hover:text-white flex items-center justify-between border-b border-white/5 pb-4"
              >
                <span>{link.label}</span>
                <span className="text-xs tracking-widest text-neutral-600">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </Link>
            ))}
          </div>

          <div className="pt-8 border-t border-white/10 space-y-4">
            {showCta && (
              <Link
                href={ctaLink}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-[0.2em] font-semibold rounded-none transition-colors"
              >
                <span>{ctaText}</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}

            <div className="flex justify-between items-center text-[10px] tracking-widest text-neutral-500 uppercase pt-4">
              <span>{settings?.email || 'reddphotographycreations@gmail.com'}</span>
              <Link href="/admin/login" className="text-neutral-600 hover:text-neutral-400">
                Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
