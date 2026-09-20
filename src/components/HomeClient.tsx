'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import PortfolioGrid from '@/components/PortfolioGrid';
import LightboxModal from '@/components/LightboxModal';
import BookingForm from '@/components/BookingForm';
import { PhotoItem, CategoryType, SiteSettings, CategoryItem, HeroSlideItem } from '@/lib/types';
import { ArrowUpRight, Award, Compass, ShieldCheck, Sparkles } from 'lucide-react';

interface HomeClientProps {
  initialPhotos: PhotoItem[];
  settings: SiteSettings;
  categories?: CategoryItem[];
  slides?: HeroSlideItem[];
}

export default function HomeClient({
  initialPhotos,
  settings: initialSettings,
  categories: initialCategories = [],
  slides: initialSlides = [],
}: HomeClientProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [slides, setSlides] = useState<HeroSlideItem[]>(initialSlides);
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Sync with live settings, categories, slides, photos and localStorage
  React.useEffect(() => {
    if (initialSettings) setSettings(initialSettings);
    if (initialCategories && initialCategories.length > 0) setCategories(initialCategories);
    if (initialSlides && initialSlides.length > 0) setSlides(initialSlides);
    if (initialPhotos && initialPhotos.length > 0) setPhotos(initialPhotos);

    try {
      const stored = localStorage.getItem('redd_site_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) setSettings(parsed);
      }
    } catch {}

    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setSettings(d.settings);
      })
      .catch(() => {});

    fetch('/api/categories', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d.categories) setCategories(d.categories);
      })
      .catch(() => {});

    fetch('/api/slides', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d.slides) setSlides(d.slides);
      })
      .catch(() => {});

    fetch('/api/gallery', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d.photos) setPhotos(d.photos);
      })
      .catch(() => {});

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
  }, [initialSettings, initialCategories, initialSlides, initialPhotos]);

  // Filtered photos based on active category
  const activePhotos =
    selectedCategory === 'all'
      ? photos
      : photos.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  const handlePhotoClick = (indexInFiltered: number) => {
    setCurrentPhotoIndex(indexInFiltered);
    setLightboxOpen(true);
  };

  const defaultDisciplines = [
    {
      key: 'fashion',
      title: 'Haute Couture & Fashion',
      desc: 'Architectural silhouettes, movement study, high-contrast fabric textures, and editorial campaigns for prestigious luxury houses.',
      tag: '01',
    },
    {
      key: 'boudoir',
      title: 'Fine-Art Boudoir',
      desc: 'An empowering, discreet, and deeply respectful environment celebrating feminine form, natural window light, and pure elegance.',
      tag: '02',
    },
    {
      key: 'portraits',
      title: 'Cinematic Portraits',
      desc: 'Chiaroscuro studio lighting capturing emotional gravity, vulnerability, and magnetic executive presence.',
      tag: '03',
    },
    {
      key: 'events',
      title: 'High-Society Events & Galas',
      desc: 'Discreet, documentary-style photojournalism capturing VIP galas, private gatherings, and fashion week celebrations.',
      tag: '04',
    },
    {
      key: 'commercial',
      title: 'Commercial & Advertising',
      desc: 'Uncompromising precision for timepiece artisans, architectural structures, and luxury product narratives.',
      tag: '05',
    },
  ];

  const displayDisciplines =
    categories.length > 0
      ? categories
          .filter((c) => c.enabled)
          .map((c, idx) => ({
            key: c.slug,
            title: c.label,
            desc:
              c.description ||
              'Specialized creative direction, precision studio lighting, and bespoke master retouching.',
            tag: String(idx + 1).padStart(2, '0'),
          }))
      : defaultDisciplines;

  return (
    <div className="min-h-screen bg-[#08080a] text-[#f3f3f5]">
      <Navbar settings={settings} />

      {/* Hero Section */}
      <HeroSection
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        selectedCategory={selectedCategory}
        categories={categories}
        slides={slides}
      />

      {/* Portfolio Gallery Grid */}
      <PortfolioGrid
        photos={photos}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onPhotoClick={handlePhotoClick}
        categories={categories}
      />

      {/* Philosophy Statement Section */}
      <section className="py-28 px-6 md:px-12 bg-[#0b0b0f] border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs uppercase tracking-[0.35em] text-red-500 font-semibold block">
              Aesthetic Philosophy
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-light text-white leading-tight">
              &ldquo;Strip away the superficial until only resonance remains.&rdquo;
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed font-light">
              Under the creative direction of {settings.artistName}, REDD Photography Creations merges
              modernist brutalism with classical chiaroscuro. Every portrait, editorial frame, and
              boudoir composition is crafted to stand as timeless art rather than fleeting trends.
            </p>
            <div className="pt-4 flex items-center space-x-8 text-neutral-300">
              <div>
                <span className="font-editorial text-4xl font-bold text-white block">
                  {settings.yearsExperience}+
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                  Years Direction
                </span>
              </div>
              <div className="w-[1px] h-10 bg-white/10" />
              <div>
                <span className="font-editorial text-4xl font-bold text-white block">
                  {settings.exhibitionsCount}
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                  Global Exhibitions
                </span>
              </div>
              <div className="w-[1px] h-10 bg-white/10" />
              <div>
                <span className="font-editorial text-4xl font-bold text-white block">
                  {settings.awardsCount}
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                  Industry Honors
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-8 bg-[#101016] border border-white/5 rounded-sm space-y-3">
              <Sparkles className="w-5 h-5 text-red-500" />
              <h4 className="text-white text-base font-medium">Architectural Light</h4>
              <p className="text-neutral-400 text-xs leading-relaxed font-light">
                Sculpting subjects with controlled shadow ratios and high-speed Profoto strobe generators,
                yielding unmistakable depth.
              </p>
            </div>
            <div className="p-8 bg-[#101016] border border-white/5 rounded-sm space-y-3">
              <ShieldCheck className="w-5 h-5 text-red-500" />
              <h4 className="text-white text-base font-medium">Discretion & Trust</h4>
              <p className="text-neutral-400 text-xs leading-relaxed font-light">
                Absolute confidentiality and a safe, empowering studio culture for private fine-art boudoir
                and high-profile clientele.
              </p>
            </div>
            <div className="p-8 bg-[#101016] border border-white/5 rounded-sm space-y-3">
              <Compass className="w-5 h-5 text-red-500" />
              <h4 className="text-white text-base font-medium">Medium Format Fidelity</h4>
              <p className="text-neutral-400 text-xs leading-relaxed font-light">
                Shot on 100-megapixel medium format Hasselblad systems for razor-sharp exhibition prints and
                commercial billboard scaling.
              </p>
            </div>
            <div className="p-8 bg-[#101016] border border-white/5 rounded-sm space-y-3">
              <Award className="w-5 h-5 text-red-500" />
              <h4 className="text-white text-base font-medium">Global Mobility</h4>
              <p className="text-neutral-400 text-xs leading-relaxed font-light">
                Fully equipped production crew available on-location in Paris, Milan, New York, Tokyo,
                and private estates worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disciplines Section */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-xs uppercase tracking-[0.35em] text-red-500 font-semibold block mb-2">
            The Studio Pillars
          </span>
          <h2 className="font-editorial text-4xl sm:text-5xl font-light text-white uppercase">
            Specialized Disciplines
          </h2>
        </div>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {displayDisciplines.map((item) => (
            <div
              key={item.key}
              onClick={() => {
                setSelectedCategory(item.key as CategoryType);
                const el = document.getElementById('work');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center group cursor-pointer hover:bg-white/[0.02] px-4 transition-colors"
            >
              <span className="md:col-span-1 text-xs font-mono text-neutral-600 group-hover:text-red-500 transition-colors">
                {item.tag}
              </span>
              <h3 className="md:col-span-4 font-editorial text-2xl sm:text-3xl text-white group-hover:text-red-400 transition-colors">
                {item.title}
              </h3>
              <p className="md:col-span-6 text-neutral-400 text-xs sm:text-sm leading-relaxed font-light">
                {item.desc}
              </p>
              <div className="md:col-span-1 flex justify-end">
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-500 group-hover:bg-red-500 group-hover:text-white text-neutral-400 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking / Inquiry Section */}
      <section id="contact" className="py-24 px-6 md:px-12 bg-[#09090d] border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs uppercase tracking-[0.35em] text-red-500 font-semibold block">
              Commissions & Bookings
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-light text-white uppercase leading-tight">
              Create Your Next Masterpiece
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed font-light">
              Whether you are an international fashion house organizing a lookbook campaign, a private
              client seeking an empowering fine-art boudoir session, or an executive commissioning a
              signature portrait series, we would be honored to discuss your vision.
            </p>

            <div className="space-y-4 pt-4 border-t border-white/10 text-sm">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 block">
                  Studio Email
                </span>
                <a
                  href={`mailto:${settings.email}`}
                  className="text-white hover:text-red-500 font-medium transition-colors"
                >
                  {settings.email}
                </a>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 block">
                  Direct Line
                </span>
                <span className="text-neutral-300">{settings.phone}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 block">
                  Primary Hubs
                </span>
                <span className="text-neutral-300">{settings.location}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <BookingForm initialCategory="fashion" categories={categories} />
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <LightboxModal
        photos={activePhotos}
        currentIndex={currentPhotoIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(index) => setCurrentPhotoIndex(index)}
      />

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
