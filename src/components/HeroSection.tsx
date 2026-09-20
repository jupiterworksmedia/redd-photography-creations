'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUpRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react';
import { CategoryType, CategoryItem, HeroSlideItem } from '@/lib/types';

interface HeroSectionProps {
  onSelectCategory?: (category: CategoryType | 'all') => void;
  selectedCategory?: string;
  categories?: CategoryItem[];
  slides?: HeroSlideItem[];
}

const DEFAULT_SLIDES: HeroSlideItem[] = [
  {
    id: 'slide-01',
    title: 'Monolith in Obsidian',
    subtitle: 'Vogue Scandinavia • Autumn / Winter Editorial',
    tagline: 'Haute Couture & Movement',
    description:
      'Sculptural silhouette editorial captured in an abandoned brutalist pavilion near Copenhagen. The interplay between fluid silk and rigid concrete.',
    imageUrl:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop',
    category: 'fashion',
    buttonText: 'Explore Fashion Editorial',
    buttonLink: '#work',
    secondaryButtonText: 'Initiate Commission',
    secondaryButtonLink: '/contact',
    textAlignment: 'left',
    fontStyle: 'editorial-serif',
    titleCase: 'uppercase',
    accentColor: 'crimson',
    overlayOpacity: 0.55,
    order: 1,
    enabled: true,
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'slide-02',
    title: 'Veil of Dawn & Linen',
    subtitle: 'Private Fine-Art Boudoir Portfolio',
    tagline: 'Intimate Fine-Art Boudoir',
    description:
      'Natural raking morning light across European raw linen. Celebrating feminine form, emotional vulnerability, and pure unforced grace.',
    imageUrl:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop',
    category: 'boudoir',
    buttonText: 'Discover Boudoir Series',
    buttonLink: '#work',
    secondaryButtonText: 'Private Booking',
    secondaryButtonLink: '/contact',
    textAlignment: 'center',
    fontStyle: 'editorial-serif',
    titleCase: 'uppercase',
    accentColor: 'gold',
    overlayOpacity: 0.5,
    order: 2,
    enabled: true,
    createdAt: '2024-01-15T12:00:00Z',
  },
  {
    id: 'slide-03',
    title: 'The Alchemist’s Study',
    subtitle: 'Master Character & Executive Series',
    tagline: 'Cinematic Chiaroscuro Portraits',
    description:
      'Caravaggesque single-source key lighting revealing authentic character, dramatic depth, and enduring emotional gravity.',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2000&auto=format&fit=crop',
    category: 'portraits',
    buttonText: 'View Portrait Works',
    buttonLink: '#work',
    secondaryButtonText: 'Reserve Studio Session',
    secondaryButtonLink: '/contact',
    textAlignment: 'left',
    fontStyle: 'editorial-serif',
    titleCase: 'uppercase',
    accentColor: 'crimson',
    overlayOpacity: 0.6,
    order: 3,
    enabled: true,
    createdAt: '2024-01-20T14:00:00Z',
  },
  {
    id: 'slide-04',
    title: 'Haute Horlogerie & Shadow',
    subtitle: 'Swiss Masterpiece Advertising Campaign',
    tagline: 'Commercial & Architectural Art',
    description:
      'High-precision macro lighting isolating titanium bevels, tourbillon mechanics, and microscopic engineering excellence.',
    imageUrl:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2000&auto=format&fit=crop',
    category: 'commercial',
    buttonText: 'Explore Commercial Works',
    buttonLink: '#work',
    secondaryButtonText: 'Brand Inquiries',
    secondaryButtonLink: '/contact',
    textAlignment: 'right',
    fontStyle: 'modern-sans',
    titleCase: 'uppercase',
    accentColor: 'white',
    overlayOpacity: 0.65,
    order: 4,
    enabled: true,
    createdAt: '2024-01-25T16:00:00Z',
  },
];

const AUTOPLAY_INTERVAL = 6000; // 6 seconds

export default function HeroSection({
  onSelectCategory,
  selectedCategory = 'all',
  categories = [],
  slides = [],
}: HeroSectionProps) {
  // Use passed active slides or fallback default 4 slides
  const activeSlides =
    slides && slides.length > 0
      ? slides.filter((s) => s.enabled)
      : DEFAULT_SLIDES;

  const displaySlides = activeSlides.length > 0 ? activeSlides : DEFAULT_SLIDES;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeCategories =
    categories.length > 0
      ? categories.filter((c) => c.enabled).map((c) => ({ key: c.slug, label: c.label }))
      : [
          { key: 'fashion', label: 'Fashion' },
          { key: 'boudoir', label: 'Boudoir' },
          { key: 'portraits', label: 'Portraits' },
          { key: 'events', label: 'Events' },
          { key: 'commercial', label: 'Commercial' },
        ];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
    setProgress(0);
  }, [displaySlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
    setProgress(0);
  }, [displaySlides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Autoplay and progress bar
  useEffect(() => {
    if (isPaused || displaySlides.length <= 1) return;

    const stepMs = 50;
    const increment = (stepMs / AUTOPLAY_INTERVAL) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isPaused, displaySlides.length, nextSlide]);

  const currentSlide = displaySlides[currentIndex] || displaySlides[0];

  // Formatting classes based on slide styling
  const alignClass =
    currentSlide.textAlignment === 'center'
      ? 'text-center items-center mx-auto'
      : currentSlide.textAlignment === 'right'
      ? 'text-right items-end ml-auto'
      : 'text-left items-start mr-auto';

  const accentColorMap: Record<string, { bar: string; text: string; button: string }> = {
    crimson: { bar: 'bg-red-600', text: 'text-red-500', button: 'border-red-600 bg-red-600/10 hover:bg-red-600' },
    red: { bar: 'bg-red-500', text: 'text-red-500', button: 'border-red-500 bg-red-500/10 hover:bg-red-500' },
    white: { bar: 'bg-white', text: 'text-white', button: 'border-white bg-white/10 hover:bg-white' },
    gold: { bar: 'bg-amber-400', text: 'text-amber-400', button: 'border-amber-400 bg-amber-400/10 hover:bg-amber-400' },
  };

  const accent = accentColorMap[currentSlide.accentColor] || accentColorMap.crimson;

  return (
    <section
      className="relative min-h-[92vh] md:min-h-[96vh] flex flex-col justify-between pt-28 pb-10 px-6 md:px-12 border-b border-white/5 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides Container */}
      <div className="absolute inset-0 z-0">
        {displaySlides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Image with subtle Ken-Burns effect */}
              <img
                src={slide.imageUrl}
                alt={slide.title}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('unsplash.com')) {
                    target.src = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop';
                  }
                }}
                className={`w-full h-full object-cover object-center transition-transform duration-[10000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />

              {/* Dynamic Overlay Dimming based on CMS configuration */}
              <div
                className="absolute inset-0 bg-black transition-opacity duration-700"
                style={{ opacity: slide.overlayOpacity ?? 0.55 }}
              />

              {/* Subtle architectural gradient scrims */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-black/60 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* Top Slider Header Bar (Counter, Progress & Controls) */}
      <div className="relative z-20 max-w-7xl mx-auto w-full pt-4 flex items-center justify-between">
        {/* Slide Counter & Category Pill */}
        <div className="flex items-center space-x-3">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-400 font-bold">
            <span className="text-white">
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
            <span className="text-neutral-600 mx-1.5">/</span>
            <span>{String(displaySlides.length).padStart(2, '0')}</span>
          </span>

          {currentSlide.category && (
            <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-neutral-300 backdrop-blur-md hidden sm:inline-block">
              {currentSlide.category}
            </span>
          )}
        </div>

        {/* Progress Timer & Pause Toggle */}
        <div className="flex items-center space-x-4">
          <div className="w-24 sm:w-36 h-[2px] bg-white/15 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${accent.bar}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="text-neutral-400 hover:text-white transition-colors p-1"
            title={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Slide Content Presentation */}
      <div className="relative z-20 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center my-auto py-12">
        <div className={`max-w-4xl flex flex-col ${alignClass} space-y-6 transition-all duration-700`}>
          {/* Eyebrow / Tagline */}
          <div className="flex items-center space-x-3">
            <span className={`w-8 h-[2px] ${accent.bar}`} />
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-neutral-300 font-medium drop-shadow">
              {currentSlide.tagline || 'Editorial & Fine Art Photography'}
            </span>
          </div>

          {/* Slide Title */}
          <h1
            className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.92] text-white font-medium drop-shadow-2xl ${
              currentSlide.fontStyle === 'modern-sans' ? 'font-sans' : 'font-editorial'
            } ${currentSlide.titleCase === 'uppercase' ? 'uppercase' : 'capitalize'}`}
          >
            {currentSlide.title}
          </h1>

          {/* Subtitle / Publication Credit */}
          {currentSlide.subtitle && (
            <p className="text-base sm:text-lg md:text-xl text-neutral-300 italic font-light drop-shadow">
              {currentSlide.subtitle}
            </p>
          )}

          {/* Description / Story */}
          {currentSlide.description && (
            <p className="text-neutral-300 text-xs sm:text-sm md:text-base font-light leading-relaxed max-w-2xl drop-shadow">
              {currentSlide.description}
            </p>
          )}

          {/* Action CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            {currentSlide.buttonText && currentSlide.buttonLink && (
              currentSlide.buttonLink.startsWith('#') ? (
                <a
                  href={currentSlide.buttonLink}
                  onClick={() => {
                    if (currentSlide.category) {
                      onSelectCategory?.(currentSlide.category);
                    }
                  }}
                  className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] font-semibold text-black bg-white hover:bg-neutral-200 px-6 sm:px-8 py-3.5 transition-all duration-300 shadow-lg shadow-black/40 hover:scale-[1.02]"
                >
                  <span>{currentSlide.buttonText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              ) : (
                <Link
                  href={currentSlide.buttonLink}
                  className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] font-semibold text-black bg-white hover:bg-neutral-200 px-6 sm:px-8 py-3.5 transition-all duration-300 shadow-lg shadow-black/40 hover:scale-[1.02]"
                >
                  <span>{currentSlide.buttonText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )
            )}

            {currentSlide.secondaryButtonText && currentSlide.secondaryButtonLink && (
              <Link
                href={currentSlide.secondaryButtonLink}
                className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] font-medium text-neutral-300 hover:text-white px-5 py-3.5 border border-white/20 hover:border-white bg-black/40 backdrop-blur-sm transition-all duration-300"
              >
                <span>{currentSlide.secondaryButtonText}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Slider Interactive Navigation Controls (Arrows & Pagination Pills) */}
      <div className="relative z-20 max-w-7xl mx-auto w-full pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Category Filter Pills for Portfolio */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center space-x-2 text-[11px] uppercase tracking-[0.25em] text-neutral-400 mr-2">
            <Camera className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline">Discipline:</span>
          </div>

          <button
            onClick={() => onSelectCategory?.('all')}
            className={`text-xs uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full border transition-all duration-300 backdrop-blur-sm ${
              selectedCategory === 'all'
                ? 'border-red-600 bg-red-600/20 text-white font-semibold'
                : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white bg-black/40'
            }`}
          >
            All Works
          </button>

          {activeCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => onSelectCategory?.(cat.key)}
              className={`text-xs uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full border transition-all duration-300 backdrop-blur-sm ${
                selectedCategory === cat.key
                  ? 'border-red-600 bg-red-600/20 text-white font-semibold'
                  : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white bg-black/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Right: Direct Slide Indicators & Arrow Controls */}
        <div className="flex items-center space-x-6 justify-between md:justify-end">
          {/* Direct Slide Dots / Pills */}
          <div className="flex items-center space-x-2">
            {displaySlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? `w-8 h-2 rounded-full ${accent.bar}`
                    : 'w-2 h-2 rounded-full bg-white/30 hover:bg-white/60'
                }`}
                title={`Jump to slide: ${slide.title}`}
              />
            ))}
          </div>

          {/* Previous / Next Arrows */}
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="w-10 h-10 rounded-full border border-white/15 bg-black/40 hover:bg-white/10 hover:border-white/40 text-neutral-300 hover:text-white flex items-center justify-center transition-all duration-200 backdrop-blur-md cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="w-10 h-10 rounded-full border border-white/15 bg-black/40 hover:bg-white/10 hover:border-white/40 text-neutral-300 hover:text-white flex items-center justify-center transition-all duration-200 backdrop-blur-md cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
