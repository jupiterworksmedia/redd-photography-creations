'use client';

import React, { useState, useEffect } from 'react';
import { InquiryItem } from '@/lib/types';
import {
  Inbox,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Trash2,
  DollarSign,
  Loader2,
  Save,
  Send,
  MessageSquare,
} from 'lucide-react';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'booked' | 'archived'>('all');
  const [notesDrafts, setNotesDrafts] = useState<{ [id: string]: string }>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      if (data.inquiries) {
        setInquiries(data.inquiries);
        // Initialize note drafts
        const initialNotes: { [id: string]: string } = {};
        data.inquiries.forEach((inq: InquiryItem) => {
          initialNotes[inq.id] = inq.notes || '';
        });
        setNotesDrafts(initialNotes);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setInquiries(
          inquiries.map((item) => (item.id === id ? { ...item, status: newStatus as InquiryItem['status'] } : item))
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleSaveNotes = async (id: string) => {
    setSavingNoteId(id);
    try {
      const notes = notesDrafts[id] || '';
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        setInquiries(
          inquiries.map((item) => (item.id === id ? { ...item, notes } : item))
        );
      }
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleDeleteInquiry = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete inquiry from "${name}"?`)) return;

    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInquiries(inquiries.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredInquiries =
    statusFilter === 'all'
      ? inquiries
      : inquiries.filter((inq) => inq.status === statusFilter);

  const statusOptions: { key: 'all' | 'new' | 'contacted' | 'booked' | 'archived'; label: string }[] = [
    { key: 'all', label: 'All Inquiries' },
    { key: 'new', label: 'New' },
    { key: 'contacted', label: 'Contacted' },
    { key: 'booked', label: 'Booked' },
    { key: 'archived', label: 'Archived' },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="pb-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-red-500 font-semibold block mb-1">
            Client Relations
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Inquiries & Booking Leads
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Submissions directly from the website booking forms.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {statusOptions.map((opt) => {
            const count =
              opt.key === 'all'
                ? inquiries.length
                : inquiries.filter((i) => i.status === opt.key).length;
            const isActive = statusFilter === opt.key;

            return (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={`text-xs uppercase tracking-wider px-3 py-1.5 rounded transition-colors ${
                  isActive
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white bg-white/5'
                }`}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
          <p className="text-xs uppercase tracking-widest text-neutral-400">Loading Inquiries...</p>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/10 rounded">
          <Inbox className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">No inquiries found in this category.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredInquiries.map((inq) => {
            const replyMailto = `mailto:${inq.email}?subject=${encodeURIComponent(
              `REDD Photography Creations — Regarding your ${inq.category} inquiry`
            )}&body=${encodeURIComponent(
              `Dear ${inq.name},\n\nThank you for inquiring with REDD Photography Creations regarding your ${inq.category} project.\n\n`
            )}`;

            return (
              <div
                key={inq.id}
                className="bg-[#0e0e14] border border-white/5 rounded-sm p-6 md:p-8 space-y-6 hover:border-white/15 transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-editorial text-2xl font-bold text-white">{inq.name}</h3>
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded bg-red-950/60 border border-red-800/40 text-red-400">
                        {inq.category}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500">
                      Received:{' '}
                      {new Date(inq.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  {/* Status dropdown and delete */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                        Status:
                      </span>
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded border focus:outline-none ${
                          inq.status === 'new'
                            ? 'bg-red-950/40 border-red-700 text-red-400'
                            : inq.status === 'contacted'
                            ? 'bg-blue-950/40 border-blue-700 text-blue-400'
                            : inq.status === 'booked'
                            ? 'bg-green-950/40 border-green-700 text-green-400'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                        }`}
                      >
                        <option value="new">New Lead</option>
                        <option value="contacted">Contacted</option>
                        <option value="booked">Booked & Confirmed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleDeleteInquiry(inq.id, inq.name)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded transition-colors"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact & Shoot Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-black/40 border border-white/5 rounded text-xs text-neutral-300">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-neutral-500 text-[10px] uppercase tracking-wider">
                      <Mail className="w-3.5 h-3.5 text-red-500" />
                      <span>Email</span>
                    </div>
                    <a
                      href={`mailto:${inq.email}`}
                      className="text-white hover:text-red-400 block truncate font-mono"
                    >
                      {inq.email}
                    </a>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-neutral-500 text-[10px] uppercase tracking-wider">
                      <Phone className="w-3.5 h-3.5 text-red-500" />
                      <span>Phone</span>
                    </div>
                    <span className="text-white font-mono">{inq.phone || '—'}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-neutral-500 text-[10px] uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-red-500" />
                      <span>Target Timeline</span>
                    </div>
                    <span className="text-white">{inq.preferredDate || 'Flexible'}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-neutral-500 text-[10px] uppercase tracking-wider">
                      <DollarSign className="w-3.5 h-3.5 text-red-500" />
                      <span>Budget Scope</span>
                    </div>
                    <span className="text-white font-medium">{inq.budgetRange || 'Unspecified'}</span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                    <MessageSquare className="w-3.5 h-3.5 text-red-500" />
                    <span>Client Project Narrative</span>
                  </div>
                  <div className="p-4 bg-[#14141b] border border-white/5 rounded text-sm text-neutral-200 leading-relaxed font-light whitespace-pre-wrap">
                    {inq.message}
                  </div>
                </div>

                {/* Internal Admin Notes & Fast Reply */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end pt-2">
                  <div className="lg:col-span-8 space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                      Private Studio Notes (Internal Only)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={notesDrafts[inq.id] || ''}
                        onChange={(e) =>
                          setNotesDrafts({ ...notesDrafts, [inq.id]: e.target.value })
                        }
                        placeholder="e.g. Sent rate card, scheduled phone call for Tuesday..."
                        className="flex-1 bg-[#14141b] border border-white/10 px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-red-600"
                      />
                      <button
                        onClick={() => handleSaveNotes(inq.id)}
                        disabled={savingNoteId === inq.id}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs flex items-center space-x-1 transition-colors disabled:opacity-50"
                      >
                        {savingNoteId === inq.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <span>Save Note</span>
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-4 flex justify-end">
                    <a
                      href={replyMailto}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-semibold rounded transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply to Client</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
