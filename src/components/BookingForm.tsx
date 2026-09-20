'use client';

import React, { useState, useEffect } from 'react';
import { CategoryType, CategoryItem } from '@/lib/types';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface BookingFormProps {
  initialCategory?: CategoryType;
  initialReference?: string;
  categories?: CategoryItem[];
}

export default function BookingForm({
  initialCategory = 'fashion',
  initialReference,
  categories = [],
}: BookingFormProps) {
  const [activeCategories, setActiveCategories] = useState<CategoryItem[]>(categories);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setActiveCategories(categories.filter((c) => c.enabled));
    } else {
      fetch('/api/categories')
        .then((r) => r.json())
        .then((d) => {
          if (d.categories) setActiveCategories(d.categories);
        })
        .catch(() => {});
    }
  }, [categories]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: initialCategory,
    preferredDate: '',
    location: '',
    budgetRange: '',
    message: initialReference ? `Referencing project: "${initialReference}" — ` : '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setSuccessMessage(data.message || 'Inquiry submitted successfully.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: initialCategory,
        preferredDate: '',
        location: '',
        budgetRange: '',
        message: '',
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f0f14] border border-white/10 rounded-sm p-8 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      {successMessage ? (
        <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-400">
          <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center mx-auto text-red-500">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-editorial text-3xl font-light text-white">Inquiry Received</h3>
          <p className="text-neutral-400 text-sm max-w-md mx-auto leading-relaxed">
            Thank you for reaching out to REDD Photography Creations. Kiran Redd and our production team
            will review your creative requirements and contact you within 24 hours.
          </p>
          <button
            onClick={() => setSuccessMessage(null)}
            className="mt-6 text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400 hover:text-white underline underline-offset-4"
          >
            Submit Another Inquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-950/40 border border-red-800/60 rounded flex items-center space-x-3 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Julianne Marchand"
                className="w-full bg-[#14141b] border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. client@domain.com"
                className="w-full bg-[#14141b] border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
                Phone / WhatsApp
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-[#14141b] border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
                Discipline / Genre <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryType })}
                className="w-full bg-[#14141b] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
              >
                {activeCategories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Date */}
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
                Target Date / Timeline
              </label>
              <input
                type="text"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                placeholder="e.g. Spring 2025"
                className="w-full bg-[#14141b] border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
                Location / City
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Paris / On-Location"
                className="w-full bg-[#14141b] border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
                Budget Scope
              </label>
              <select
                value={formData.budgetRange}
                onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                className="w-full bg-[#14141b] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
              >
                <option value="">Select scope</option>
                <option value="$2,500 - $5,000">$2,500 – $5,000 (Individual / Portrait)</option>
                <option value="$5,000 - $10,000">$5,000 – $10,000 (Editorial / Boudoir)</option>
                <option value="$10,000 - $25,000">$10,000 – $25,000 (Commercial / Fashion)</option>
                <option value="$25,000+">$25,000+ (Full Campaign / Global)</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
              Creative Brief / Message <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us about your project concept, mood, specific deliverables, or questions..."
              className="w-full bg-[#14141b] border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-[0.25em] font-semibold transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transmitting Inquiry...</span>
              </>
            ) : (
              <>
                <span>Submit Booking Request</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
