import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { getSettings, getCategories } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function ServicesPage() {
  const settings = getSettings();
  const categories = getCategories(false);

  const serviceOfferings = [
    {
      category: 'fashion',
      title: 'Haute Couture & Editorial Fashion',
      eyebrow: 'Editorial Campaigns & Lookbooks',
      description:
        'Designed for high-end fashion labels, independent designers, and editorial publications. We craft architectural, dynamic narratives that treat garments as sculptural art in motion.',
      features: [
        'Full moodboard, concept development, and casting support',
        'Multi-light studio setup or location scouts (brutalist, natural, urban)',
        'Lookbook and high-res campaign assets formatted for print & web',
        'Hair, makeup, and wardrobe styling coordination upon request',
      ],
      idealFor: 'Designers, magazines, modeling agencies, and couture ateliers',
      investment: 'From $6,500',
    },
    {
      category: 'boudoir',
      title: 'Fine-Art Boudoir & Intimate Form',
      eyebrow: 'Empowering, Safe & Tasteful Fine-Art',
      description:
        'An artistic celebration of feminine form, self-love, and vulnerability. Executed in a completely safe, private, and discreet setting using soft natural window light and Belgian linen textures.',
      features: [
        'Strict privacy guarantee and confidential image handling',
        'Pre-session wardrobe consultation and styling guide',
        'Gentle, body-affirming posing guidance (no prior modeling experience needed)',
        'Signature fine-art retouching focusing on natural skin fidelity and tones',
      ],
      idealFor: 'Milestone celebrations, personal empowerment, bridal gifts, and fine-art collectors',
      investment: 'From $2,800',
    },
    {
      category: 'portraits',
      title: 'Cinematic & Executive Portraiture',
      eyebrow: 'Personal Branding & Character Studies',
      description:
        'Far beyond standard corporate headshots. We construct moody, high-contrast chiaroscuro character studies that project gravity, intellect, and timeless distinction.',
      features: [
        'One-on-one focused studio session with tethered monitor review',
        'Multiple lighting setups (dramatic rim light, Rembrandt key, soft daylight)',
        'Master retouched portraits delivered in web and gallery print formats',
        'Commercial usage license for press releases, books, and digital presence',
      ],
      idealFor: 'CEOs, founders, artists, directors, authors, and thought leaders',
      investment: 'From $1,800',
    },
    {
      category: 'events',
      title: 'High-Society Galas & Runway Events',
      eyebrow: 'Documentary Elegance & VIP Gatherings',
      description:
        'Discreet, candid visual documentation of premier events. We capture unposed laughter, kinetic ballroom atmosphere, and VIP elegance without invasive flash interruption.',
      features: [
        'Unobtrusive photojournalistic coverage by experienced lead photographer',
        'Same-night or 24-hour press highlight delivery for PR wire & social media',
        'Full high-resolution master collection with complete archival color grades',
        'Red carpet arrival and ambient architectural venue coverage',
      ],
      idealFor: 'Luxury charity galas, fashion shows, private brand dinners, and cultural summits',
      investment: 'From $4,500',
    },
    {
      category: 'commercial',
      title: 'Commercial & Advertising Campaigns',
      eyebrow: 'Product, Automotive & Architectural Imagery',
      description:
        'Hyper-focused commercial precision. Shot on 100-megapixel medium format sensors to highlight microscopic craftsmanship, materials, and luxury brand prestige.',
      features: [
        'Macro precision lighting for timepieces, jewelry, and perfumery',
        'Architectural interior & exterior twilight captures with perspective control',
        'Global buyout and worldwide digital/print advertising licensing',
        'Extensive digital compositing, focus stacking, and color accuracy certification',
      ],
      idealFor: 'Horology brands, architects, luxury hospitality, and premium consumer goods',
      investment: 'Custom Quote',
    },
  ];

  return (
    <div className="min-h-screen bg-[#08080a] text-[#f3f3f5]">
      <Navbar settings={settings} />

      <main className="pt-36 pb-24">
        {/* Header */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-20">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-8 h-[1px] bg-red-600"></span>
            <span className="text-[11px] uppercase tracking-[0.35em] text-neutral-400 font-medium">
              Bespoke Production Services
            </span>
          </div>
          <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl font-light text-white uppercase leading-[0.95] max-w-5xl">
            Disciplines & <span className="italic text-neutral-300">Commissions</span>
          </h1>
          <p className="text-neutral-400 text-base md:text-lg max-w-2xl mt-6 font-light leading-relaxed">
            Every project is treated as an individual piece of art. Explore our specialized services across
            the five pillars of REDD Photography Creations.
          </p>
        </section>

        {/* Services List */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto space-y-12 mb-28">
          {serviceOfferings.map((service, index) => (
            <div
              key={service.category}
              className="p-8 md:p-12 bg-[#0d0d12] border border-white/5 rounded-sm hover:border-white/20 transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono text-neutral-600">0{index + 1}</span>
                    <span className="text-xs uppercase tracking-[0.25em] text-red-500 font-semibold">
                      {service.eyebrow}
                    </span>
                  </div>
                  <h2 className="font-editorial text-3xl sm:text-4xl text-white font-medium">
                    {service.title}
                  </h2>
                  <p className="text-neutral-300 text-sm md:text-base leading-relaxed font-light">
                    {service.description}
                  </p>

                  <div className="pt-4">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 block mb-3 font-semibold">
                      Included Production Elements:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {service.features.map((feat, i) => (
                        <li key={i} className="flex items-start space-x-2 text-xs text-neutral-300">
                          <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6 lg:pl-8 lg:border-l lg:border-white/5">
                  <div className="space-y-4 bg-black/40 p-6 rounded border border-white/5">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 block mb-1">
                        Ideal Clientele
                      </span>
                      <p className="text-xs text-neutral-300 leading-relaxed">{service.idealFor}</p>
                    </div>

                    <div className="pt-3 border-t border-white/5">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 block mb-1">
                        Starting Investment
                      </span>
                      <span className="font-editorial text-2xl text-white font-semibold">
                        {service.investment}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/contact?category=${service.category}`}
                    className="w-full inline-flex items-center justify-center space-x-2 py-3.5 bg-white text-black hover:bg-neutral-200 text-xs uppercase tracking-[0.2em] font-semibold transition-colors"
                  >
                    <span>Inquire About This Service</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* The Production Journey */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-24 py-16 bg-[#0c0c10] border-y border-white/5">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-[0.35em] text-red-500 font-semibold block mb-2">
              The Experience
            </span>
            <h2 className="font-editorial text-4xl text-white uppercase font-light">
              From Concept to Master Print
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 border border-white/5 bg-black/30 space-y-3">
              <span className="text-xs font-mono text-red-500 block">STEP 01</span>
              <h3 className="text-white text-base font-medium">Vision Consultation</h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-light">
                We align on your creative intent, moodboards, color palette, location requirements, and
                styling references.
              </p>
            </div>
            <div className="p-6 border border-white/5 bg-black/30 space-y-3">
              <span className="text-xs font-mono text-red-500 block">STEP 02</span>
              <h3 className="text-white text-base font-medium">Production Day</h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-light">
                Meticulous execution with tethered medium-format capture, continuous direction, and
                stress-free atmosphere.
              </p>
            </div>
            <div className="p-6 border border-white/5 bg-black/30 space-y-3">
              <span className="text-xs font-mono text-red-500 block">STEP 03</span>
              <h3 className="text-white text-base font-medium">Master Color Grading</h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-light">
                Individual tonal sculpting, frequency separation retouching, and cinematic color curves
                applied by hand.
              </p>
            </div>
            <div className="p-6 border border-white/5 bg-black/30 space-y-3">
              <span className="text-xs font-mono text-red-500 block">STEP 04</span>
              <h3 className="text-white text-base font-medium">Archival Delivery</h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-light">
                Private digital cloud gallery with full-resolution master files and optional handmade
                fine-art prints.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
