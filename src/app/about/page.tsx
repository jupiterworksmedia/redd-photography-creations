import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSettings, getCategories } from '@/lib/db';
import Link from 'next/link';
import { ArrowUpRight, Camera, Award, Sparkles, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AboutPage() {
  const settings = getSettings();
  const categories = getCategories(false);

  return (
    <div className="min-h-screen bg-[#08080a] text-[#f3f3f5]">
      <Navbar settings={settings} />

      <main className="pt-36 pb-24">
        {/* Header Title */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-20">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-8 h-[1px] bg-red-600"></span>
            <span className="text-[11px] uppercase tracking-[0.35em] text-neutral-400 font-medium">
              About The Director & Studio
            </span>
          </div>
          <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl font-light text-white uppercase leading-[0.95] max-w-5xl">
            A relentless pursuit of <span className="italic text-neutral-300">visual purity</span>.
          </h1>
        </section>

        {/* Artist Biography & Studio Vision */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 mb-28">
          {/* Portrait Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#101015] border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop"
                alt="Kiran Redd - Director of REDD Photography Creations"
                className="w-full h-full object-cover filter grayscale contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] uppercase tracking-[0.25em] text-red-500 font-semibold block">
                  Creative Director
                </span>
                <h3 className="font-editorial text-2xl text-white font-medium">{settings.artistName}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Founding Principal, REDD Studio</p>
              </div>
            </div>
          </div>

          {/* Philosophy Prose */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
            <div className="space-y-5 text-neutral-300 text-base md:text-lg font-light leading-relaxed">
              <p>
                {settings.bio}
              </p>
              <p>
                &ldquo;Modernism in photography is not merely about cold lines—it is the deliberate stripping away
                of clutter to allow genuine human truth, organic texture, and form to command the viewer’s full attention.&rdquo;
              </p>
              <p className="text-sm text-neutral-400">
                Whether orchestrating a 20-person crew on a high-fashion campaign in Milan, working one-on-one
                in an intimate and empowering fine-art boudoir setting, or crafting an authoritative corporate
                portrait, Kiran’s method is grounded in patience, anatomical awareness, and absolute technical mastery.
              </p>
            </div>

            {/* Milestones */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
              <div>
                <span className="font-editorial text-4xl sm:text-5xl font-bold text-white block">
                  {settings.yearsExperience}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                  Years Behind Lens
                </span>
              </div>
              <div>
                <span className="font-editorial text-4xl sm:text-5xl font-bold text-white block">
                  {settings.exhibitionsCount}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                  Solo Exhibitions
                </span>
              </div>
              <div>
                <span className="font-editorial text-4xl sm:text-5xl font-bold text-white block">
                  {settings.awardsCount}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                  International Awards
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Selected Publications & Honors */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-28 py-16 bg-[#0c0c10] border-y border-white/5">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-[0.35em] text-red-500 font-semibold">
                Recognition
              </span>
              <h2 className="font-editorial text-4xl text-white uppercase font-light">
                Features & Honors
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center pt-6">
              <div className="p-6 border border-white/5 bg-black/40 rounded-sm">
                <span className="font-editorial text-2xl text-white block mb-1">VOGUE</span>
                <span className="text-[10px] uppercase tracking-widest text-neutral-500">Scandinavia & Italia</span>
              </div>
              <div className="p-6 border border-white/5 bg-black/40 rounded-sm">
                <span className="font-editorial text-2xl text-white block mb-1">VANITY FAIR</span>
                <span className="text-[10px] uppercase tracking-widest text-neutral-500">Executive Portraiture</span>
              </div>
              <div className="p-6 border border-white/5 bg-black/40 rounded-sm">
                <span className="font-editorial text-2xl text-white block mb-1">ARCH DIGEST</span>
                <span className="text-[10px] uppercase tracking-widest text-neutral-500">Commercial Architecture</span>
              </div>
              <div className="p-6 border border-white/5 bg-black/40 rounded-sm">
                <span className="font-editorial text-2xl text-white block mb-1">PX3 PARIS</span>
                <span className="text-[10px] uppercase tracking-widest text-neutral-500">Gold Award Winner</span>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Gear Arsenal */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-24">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.35em] text-red-500 font-semibold block mb-2">
              The Optical Arsenal
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-light text-white uppercase">
              Curated Production Gear
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#101016] border border-white/5 rounded-sm space-y-4">
              <div className="flex items-center space-x-3 text-red-500">
                <Camera className="w-5 h-5" />
                <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Camera Systems</h3>
              </div>
              <ul className="space-y-2 text-xs text-neutral-300 font-mono">
                {settings.gearKit.cameras.map((cam, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    <span>{cam}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 bg-[#101016] border border-white/5 rounded-sm space-y-4">
              <div className="flex items-center space-x-3 text-red-500">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Prime Optics</h3>
              </div>
              <ul className="space-y-2 text-xs text-neutral-300 font-mono">
                {settings.gearKit.lenses.map((lens, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    <span>{lens}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 bg-[#101016] border border-white/5 rounded-sm space-y-4">
              <div className="flex items-center space-x-3 text-red-500">
                <Award className="w-5 h-5" />
                <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Lighting Modifiers</h3>
              </div>
              <ul className="space-y-2 text-xs text-neutral-300 font-mono">
                {settings.gearKit.lighting.map((light, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    <span>{light}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA to Book */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto text-center py-16 border-t border-white/10">
          <h3 className="font-editorial text-4xl text-white font-light mb-4">
            Commission a Visual Narrative
          </h3>
          <p className="text-neutral-400 text-sm max-w-lg mx-auto mb-8 font-light">
            Available for private sessions, high-fashion campaigns, and commercial briefs globally.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.25em] font-semibold text-black bg-white hover:bg-neutral-200 px-8 py-4 transition-colors"
          >
            <span>Request Shoot Consultation</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
