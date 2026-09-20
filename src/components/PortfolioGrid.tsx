'use client';

import React from 'react';
import { PhotoItem, CategoryType, CategoryItem } from '@/lib/types';
import { ArrowUpRight, Camera } from 'lucide-react';

interface PortfolioGridProps {
  photos: PhotoItem[];
  selectedCategory: string;
  onSelectCategory: (category: CategoryType | 'all') => void;
  onPhotoClick: (index: number) => void;
  categories?: CategoryItem[];
}

export default function PortfolioGrid({
  photos,
  selectedCategory,
  onSelectCategory,
  onPhotoClick,
  categories = [],
}: PortfolioGridProps) {
  // Use passed categories (filtered for enabled) or standard fallback
  const activeTabs: { key: CategoryType | 'all'; label: string }[] = [
    { key: 'all', label: 'All Series' },
    ...(categories.length > 0
      ? categories.filter((c) => c.enabled).map((c) => ({ key: c.slug, label: c.label }))
      : [
          { key: 'fashion', label: 'Fashion' },
          { key: 'boudoir', label: 'Boudoir' },
          { key: 'portraits', label: 'Portraits' },
          { key: 'events', label: 'Events' },
          { key: 'commercial', label: 'Commercial' },
        ]),
  ];

  const filteredPhotos =
    selectedCategory === 'all'
      ? photos
      : photos.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section id="work" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-white/10 gap-6">
        <div>
          <span className="text-xs uppercase tracking-[0.35em] text-red-500 font-semibold block mb-2">
            Selected Works
          </span>
          <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-light text-white uppercase tracking-tight">
            Portfolio Gallery
          </h2>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTabs.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => onSelectCategory(cat.key)}
                className={`text-xs uppercase tracking-[0.2em] px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'border-red-600 bg-red-600/10 text-white font-semibold'
                    : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Layout */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-sm">
          <p className="text-neutral-500 font-light text-sm uppercase tracking-widest">
            No projects currently categorized under this discipline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredPhotos.map((photo, index) => {
            const isSpanTwo = photo.aspectRatio === 'wide' && index % 3 === 0;

            return (
              <div
                key={photo.id}
                onClick={() => onPhotoClick(index)}
                className={`group relative cursor-pointer overflow-hidden rounded-sm bg-[#101014] border border-white/5 photo-card ${
                  isSpanTwo ? 'md:col-span-2' : ''
                }`}
              >
                {/* Image Container with Aspect Ratio */}
                <div
                  className={`relative w-full overflow-hidden bg-neutral-900 ${
                    photo.aspectRatio === 'tall'
                      ? 'aspect-[3/4]'
                      : photo.aspectRatio === 'wide'
                      ? 'aspect-[16/10]'
                      : 'aspect-square'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-[0.92] contrast-[1.05] group-hover:brightness-100"
                  />

                  {/* Dark Gradient Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                  {/* Featured Badge */}
                  {photo.featured && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="text-[9px] uppercase tracking-[0.25em] font-semibold px-2.5 py-1 bg-red-600/90 text-white rounded-none">
                        Featured
                      </span>
                    </div>
                  )}

                  {/* Category Pill Top Right */}
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium px-3 py-1 bg-black/70 backdrop-blur-md text-neutral-300 rounded-full border border-white/10 flex items-center space-x-1.5">
                      <span>{photo.category}</span>
                      <ArrowUpRight className="w-3 h-3 text-red-500" />
                    </span>
                  </div>

                  {/* Bottom Information */}
                  <div className="absolute bottom-0 inset-x-0 p-6 z-10 flex flex-col justify-end transform transition-transform duration-300">
                    <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.25em] text-red-500 font-semibold mb-1">
                      <span>{photo.category}</span>
                      {photo.year && <span className="text-neutral-500">• {photo.year}</span>}
                    </div>

                    <h3 className="font-editorial text-2xl font-medium text-white group-hover:text-red-400 transition-colors leading-snug">
                      {photo.title}
                    </h3>

                    {photo.client && (
                      <p className="text-xs text-neutral-400 mt-1 font-light tracking-wide truncate">
                        {photo.client}
                      </p>
                    )}

                    {/* Camera Spec tag on hover */}
                    {photo.camera && (
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] tracking-wider font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="flex items-center space-x-1">
                          <Camera className="w-3 h-3 text-neutral-500" />
                          <span>{photo.camera}</span>
                        </span>
                        <span>{photo.lens}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
