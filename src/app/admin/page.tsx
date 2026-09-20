import React from 'react';
import Link from 'next/link';
import { getPhotos, getInquiries, getSettings, getCategories } from '@/lib/db';
import {
  Image as ImageIcon,
  Inbox,
  Sparkles,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  Mail,
  Camera,
  Tags,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const photos = getPhotos(undefined, undefined, true);
  const inquiries = getInquiries();
  const settings = getSettings();
  const categories = getCategories(true);

  const newInquiries = inquiries.filter((i) => i.status === 'new');
  const enabledCategories = categories.filter((c) => c.enabled);

  return (
    <div className="space-y-10 max-w-6xl">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2 text-xs uppercase tracking-[0.25em] text-red-500 font-semibold mb-1">
            <span>Administrative Control Center</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Logged in as <span className="text-neutral-200 font-mono">reddphotographycreations@gmail.com</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/categories"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs uppercase tracking-wider font-semibold rounded-sm border border-white/10 transition-colors"
          >
            <Tags className="w-4 h-4 text-red-500" />
            <span>Categories</span>
          </Link>
          <Link
            href="/admin/gallery"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Photo</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs uppercase tracking-wider font-semibold rounded-sm border border-white/10 transition-colors"
          >
            <span>Live Site</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-[#0e0e14] border border-white/5 rounded-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase tracking-wider font-medium">Total Portfolio</span>
            <ImageIcon className="w-4 h-4 text-red-500" />
          </div>
          <p className="font-editorial text-4xl font-bold text-white">{photos.length}</p>
          <p className="text-[11px] text-neutral-500">Live photographs showcased</p>
        </div>

        <div className="p-6 bg-[#0e0e14] border border-white/5 rounded-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase tracking-wider font-medium">New Inquiries</span>
            <Inbox className="w-4 h-4 text-red-500" />
          </div>
          <p className="font-editorial text-4xl font-bold text-white">{newInquiries.length}</p>
          <p className="text-[11px] text-red-400 font-medium">
            {newInquiries.length > 0 ? 'Awaiting studio response' : 'Inbox up to date'}
          </p>
        </div>

        <div className="p-6 bg-[#0e0e14] border border-white/5 rounded-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase tracking-wider font-medium">Total Bookings Logged</span>
            <Mail className="w-4 h-4 text-red-500" />
          </div>
          <p className="font-editorial text-4xl font-bold text-white">{inquiries.length}</p>
          <p className="text-[11px] text-neutral-500">Lifetime client requests</p>
        </div>

        <div className="p-6 bg-[#0e0e14] border border-white/5 rounded-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase tracking-wider font-medium">Active Disciplines</span>
            <Sparkles className="w-4 h-4 text-red-500" />
          </div>
          <p className="font-editorial text-4xl font-bold text-white">{enabledCategories.length}</p>
          <p className="text-[11px] text-neutral-500">{categories.length} total options configured</p>
        </div>
      </div>

      {/* Category Breakdown Bar */}
      <div className="p-6 bg-[#0e0e14] border border-white/5 rounded-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-300 font-semibold">
            Portfolio Distribution Across Disciplines
          </h3>
          <Link href="/admin/categories" className="text-xs text-red-500 hover:text-red-400 transition-colors">
            Manage Categories & Options →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
          {categories.map((cat) => {
            const count = photos.filter(
              (p) => p.category.toLowerCase() === cat.slug.toLowerCase()
            ).length;
            return (
              <div
                key={cat.id}
                className={`p-3 bg-black/40 border rounded text-center transition-all ${
                  cat.enabled ? 'border-white/5' : 'border-dashed border-neutral-700 opacity-60'
                }`}
              >
                <div className="flex items-center justify-center space-x-1.5 mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 truncate">
                    {cat.label}
                  </span>
                  {!cat.enabled && (
                    <span className="text-[8px] text-amber-400 uppercase font-mono px-1 bg-amber-950/50 rounded">
                      Off
                    </span>
                  )}
                </div>
                <span className="font-editorial text-2xl font-bold text-white">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Recent Inquiries & Recent Photos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Latest Inquiries */}
        <div className="lg:col-span-7 bg-[#0e0e14] border border-white/5 rounded-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Inbox className="w-4 h-4 text-red-500" />
              <h3 className="text-xs uppercase tracking-[0.2em] text-white font-semibold">
                Recent Client Inquiries
              </h3>
            </div>
            <Link
              href="/admin/inquiries"
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              View All ({inquiries.length}) →
            </Link>
          </div>

          {inquiries.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">No inquiries received yet.</p>
          ) : (
            <div className="space-y-3">
              {inquiries.slice(0, 4).map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 bg-black/40 border border-white/5 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white font-medium">{inq.name}</span>
                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-semibold">
                        {inq.category}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 truncate max-w-sm">{inq.message}</p>
                    <span className="text-[10px] text-neutral-500 block">
                      {new Date(inq.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${
                        inq.status === 'new'
                          ? 'bg-red-600/20 text-red-400 border border-red-500/40'
                          : inq.status === 'contacted'
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                          : 'bg-green-600/20 text-green-400 border border-green-500/40'
                      }`}
                    >
                      {inq.status}
                    </span>
                    <Link
                      href="/admin/inquiries"
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 rounded"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Works Preview */}
        <div className="lg:col-span-5 bg-[#0e0e14] border border-white/5 rounded-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-red-500" />
              <h3 className="text-xs uppercase tracking-[0.2em] text-white font-semibold">
                Recently Added Works
              </h3>
            </div>
            <Link
              href="/admin/gallery"
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Gallery Manager →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {photos.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="group relative aspect-square overflow-hidden rounded bg-neutral-900 border border-white/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-[9px] uppercase tracking-wider text-red-400 font-semibold block">
                    {p.category}
                  </span>
                  <p className="text-xs text-white font-medium truncate">{p.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
