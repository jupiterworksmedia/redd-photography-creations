'use client';

import React, { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, Camera, Info, ArrowUpRight, Calendar, MapPin, Sliders } from 'lucide-react';
import { PhotoItem } from '@/lib/types';

interface LightboxModalProps {
  photos: PhotoItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function LightboxModal({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: LightboxModalProps) {
  const currentPhoto = photos[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0); // loop back
    }
  }, [currentIndex, photos.length, onNavigate]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(photos.length - 1); // loop back
    }
  }, [currentIndex, photos.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || !currentPhoto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#050508]/96 backdrop-blur-xl flex flex-col justify-between animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 z-10">
        <div className="flex items-center space-x-4">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-red-500">
            {currentPhoto.category}
          </span>
          <span className="text-neutral-600">•</span>
          <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-neutral-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors focus:outline-none"
          aria-label="Close Lightbox"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area: Image + Details */}
      <div className="relative flex-1 flex flex-col lg:flex-row items-center justify-center p-4 md:p-8 overflow-y-auto lg:overflow-hidden gap-8">
        {/* Navigation Arrow Left */}
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/70 hover:text-white border border-white/10 transition-all focus:outline-none"
          aria-label="Previous Image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Image Display */}
        <div className="flex-1 flex items-center justify-center max-h-[70vh] lg:max-h-[82vh] w-full relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentPhoto.imageUrl}
            alt={currentPhoto.title}
            className="max-h-[70vh] lg:max-h-[82vh] max-w-full w-auto object-contain rounded-sm shadow-2xl transition-opacity duration-300"
          />
        </div>

        {/* Navigation Arrow Right */}
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-6 lg:right-[380px] top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/70 hover:text-white border border-white/10 transition-all focus:outline-none"
          aria-label="Next Image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Details Sidebar */}
        <div className="w-full lg:w-[360px] bg-[#0c0c10] border border-white/10 rounded-sm p-6 flex flex-col justify-between space-y-6 shrink-0 lg:max-h-[82vh] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-red-500 font-semibold block mb-1">
                {currentPhoto.category}
              </span>
              <h3 className="font-editorial text-2xl font-bold text-white leading-tight">
                {currentPhoto.title}
              </h3>
              {currentPhoto.client && (
                <p className="text-xs text-neutral-400 tracking-wider mt-1">
                  Commission: <span className="text-neutral-200">{currentPhoto.client}</span>
                </p>
              )}
            </div>

            {currentPhoto.story && (
              <div className="text-neutral-300 text-xs leading-relaxed font-light border-t border-white/5 pt-3">
                <p>{currentPhoto.story}</p>
              </div>
            )}

            {/* Context Info */}
            <div className="grid grid-cols-2 gap-3 text-xs text-neutral-400 border-t border-white/5 pt-3">
              {currentPhoto.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span className="truncate">{currentPhoto.location}</span>
                </div>
              )}
              {currentPhoto.year && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span>{currentPhoto.year}</span>
                </div>
              )}
            </div>

            {/* Photographic EXIF Specs */}
            {(currentPhoto.camera || currentPhoto.lens || currentPhoto.aperture) && (
              <div className="border-t border-white/10 pt-4 space-y-2.5">
                <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-semibold">
                  <Camera className="w-3.5 h-3.5 text-red-500" />
                  <span>Technical Specifications</span>
                </div>

                <div className="bg-black/40 rounded p-3 text-[11px] space-y-1.5 font-mono text-neutral-300 border border-white/5">
                  {currentPhoto.camera && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Body:</span>
                      <span className="text-neutral-200">{currentPhoto.camera}</span>
                    </div>
                  )}
                  {currentPhoto.lens && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Lens:</span>
                      <span className="text-neutral-200">{currentPhoto.lens}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-white/5 text-[10px]">
                    {currentPhoto.aperture && <span>{currentPhoto.aperture}</span>}
                    {currentPhoto.shutterSpeed && <span>{currentPhoto.shutterSpeed}</span>}
                    {currentPhoto.iso && <span>ISO {currentPhoto.iso}</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-white/10">
            <Link
              href={`/contact?category=${currentPhoto.category}&reference=${encodeURIComponent(currentPhoto.title)}`}
              onClick={onClose}
              className="w-full inline-flex items-center justify-center space-x-2 py-3 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-[0.2em] font-semibold transition-colors"
            >
              <span>Inquire For Shoot Like This</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Controls */}
      <div className="md:hidden flex items-center justify-between px-6 py-3 border-t border-white/10 bg-[#08080a]">
        <button
          onClick={handlePrev}
          className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <button
          onClick={handleNext}
          className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-white"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
