import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingForm from '@/components/BookingForm';
import { getSettings, getCategories } from '@/lib/db';
import { Mail, Phone, MapPin, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { CategoryType } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface ContactPageProps {
  searchParams: {
    category?: string;
    reference?: string;
  };
}

export default function ContactPage({ searchParams }: ContactPageProps) {
  const settings = getSettings();
  const categories = getCategories(false);
  const categoryParam = (searchParams.category?.toLowerCase() as CategoryType) || 'fashion';
  const referenceParam = searchParams.reference || '';

  const faqs = [
    {
      q: 'How far in advance should we reserve a shoot?',
      a: 'For commercial campaigns and wedding/event galas, we suggest booking 2–4 months in advance. For individual boudoir and portrait commissions, 3–6 weeks notice is typically sufficient.',
    },
    {
      q: 'Do you travel internationally for assignments?',
      a: 'Yes. REDD Photography Creations operates regularly across New York, Paris, Milan, London, and Tokyo. We handle all international production logistics and gear carnets.',
    },
    {
      q: 'What is your privacy policy regarding Boudoir shoots?',
      a: 'Privacy and bodily autonomy are inviolable. We never publish or display boudoir imagery online or in print without the client’s explicit written consent on a separate release form.',
    },
    {
      q: 'What is the turnaround time for delivered images?',
      a: 'Press preview images for galas and events are delivered within 24 hours. Full master-retouched collections for editorial, boudoir, and commercial briefs are delivered within 14 business days.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#08080a] text-[#f3f3f5]">
      <Navbar settings={settings} />

      <main className="pt-36 pb-24">
        {/* Header Title */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-16">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-8 h-[1px] bg-red-600"></span>
            <span className="text-[11px] uppercase tracking-[0.35em] text-neutral-400 font-medium">
              Direct Inquiries & Bookings
            </span>
          </div>
          <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl font-light text-white uppercase leading-[0.95] max-w-5xl">
            Let’s initiate the <span className="italic text-neutral-300">dialogue</span>.
          </h1>
        </section>

        {/* Form and Contact Information Grid */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 mb-28">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-4">
              <h3 className="font-editorial text-3xl text-white font-medium">Direct Studio Access</h3>
              <p className="text-neutral-400 text-sm leading-relaxed font-light">
                Please provide as much detail as possible about your shoot timeline, location, aesthetic
                intent, and deliverables. All inquiries are personally read and answered by our studio
                director.
              </p>
            </div>

            <div className="space-y-6 text-sm">
              <div className="flex items-start space-x-4 p-4 bg-[#101015] border border-white/5 rounded-sm">
                <Mail className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 block mb-1">
                    Direct Email
                  </span>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-white hover:text-red-500 font-medium transition-colors"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-[#101015] border border-white/5 rounded-sm">
                <Phone className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 block mb-1">
                    Telephone / WhatsApp
                  </span>
                  <span className="text-white font-medium">{settings.phone}</span>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-[#101015] border border-white/5 rounded-sm">
                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 block mb-1">
                    Global Studio Presence
                  </span>
                  <span className="text-white font-medium">{settings.location}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-red-950/20 border border-red-800/30 rounded-sm space-y-3">
              <div className="flex items-center space-x-2 text-red-400 text-xs uppercase tracking-wider font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Discretion Guarantee</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                All client consultations and boudoir assignments are held in the strictest confidence.
                NDAs signed upon request for high-profile figures and commercial IP campaigns.
              </p>
            </div>
          </div>

          {/* Booking Form Column */}
          <div className="lg:col-span-7">
            <BookingForm initialCategory={categoryParam} initialReference={referenceParam} />
          </div>
        </section>

        {/* FAQs */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto py-16 bg-[#0c0c10] border-y border-white/5">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-[0.35em] text-red-500 font-semibold">
                Client Questions
              </span>
              <h2 className="font-editorial text-4xl text-white uppercase font-light">
                Frequently Asked
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-6 bg-black/40 border border-white/5 rounded-sm space-y-2.5">
                  <h4 className="text-white text-base font-medium flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-red-500 shrink-0 mt-1" />
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed font-light pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
