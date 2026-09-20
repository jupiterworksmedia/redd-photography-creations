import type { Metadata } from 'next';
import Script from 'next/script';
import { getSeoSettings, getSettings, getCategories } from '@/lib/db';
import './globals.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoSettings();
  const settings = getSettings();
  const baseUrl = (seo.canonicalUrl || 'https://reddphotographycreations.com').replace(/\/$/, '');

  const title = seo.metaTitle || `${settings.brandName} | Modernist Photography`;
  const description = seo.metaDescription || settings.heroSubtitle;
  const ogImage = seo.ogImageUrl || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1600&auto=format&fit=crop';

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${settings.brandName}`,
    },
    description,
    keywords: seo.keywords && seo.keywords.length > 0 ? seo.keywords : [
      'REDD Photography Creations',
      'Fashion Photography',
      'Boudoir Photography',
      'Fine Art Boudoir',
      'Portrait Photographer',
      'Commercial Photography',
    ],
    authors: [{ name: settings.brandName, url: baseUrl }],
    creator: settings.artistName,
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      url: baseUrl,
      siteName: settings.brandName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: settings.brandName,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: seo.twitterCardType || 'summary_large_image',
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      images: [ogImage],
      creator: seo.twitterHandle || '@reddphotography',
    },
    robots: {
      index: seo.robotsIndex,
      follow: seo.robotsFollow,
      googleBot: {
        index: seo.robotsIndex,
        follow: seo.robotsFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: seo.googleSiteVerification || undefined,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const seo = getSeoSettings();
  const settings = getSettings();
  const categories = getCategories(false);
  const baseUrl = (seo.canonicalUrl || 'https://reddphotographycreations.com').replace(/\/$/, '');

  // Schema.org JSON-LD Structured Data
  const jsonLd = seo.enableSchemaOrg
    ? {
        '@context': 'https://schema.org',
        '@type': seo.schemaType || 'Photographer',
        name: settings.brandName,
        founder: {
          '@type': 'Person',
          name: settings.artistName,
          jobTitle: 'Creative Director & Lead Photographer',
        },
        url: baseUrl,
        logo: `${baseUrl}/favicon.ico`,
        image: seo.ogImageUrl || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1600&auto=format&fit=crop',
        description: seo.metaDescription || settings.bio,
        email: settings.email,
        telephone: settings.phone,
        address: {
          '@type': 'PostalAddress',
          addressLocality: settings.location,
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Photography Services',
          itemListElement: categories.map((cat, i) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: cat.label,
              description: cat.description,
            },
            position: i + 1,
          })),
        },
        sameAs: [
          settings.socials.instagram,
          settings.socials.behance,
          settings.socials.vimeo,
          settings.socials.linkedin,
        ].filter(Boolean),
        priceRange: '$$$$',
      }
    : null;

  return (
    <html lang="en" className="dark">
      <head>
        {/* Meta Domain Verification */}
        {seo.metaDomainVerification && (
          <meta name="facebook-domain-verification" content={seo.metaDomainVerification} />
        )}

        {/* JSON-LD Structured Data */}
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
      </head>
      <body className="min-h-screen bg-[#08080a] text-[#f3f3f5] antialiased selection:bg-red-600 selection:text-white">
        {/* Google Tag Manager (noscript fallback) */}
        {seo.googleTagManagerId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${seo.googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        {/* Meta Pixel (noscript fallback) */}
        {seo.metaPixelId && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${seo.metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}

        {children}

        {/* Google Analytics 4 (GA4) */}
        {seo.googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${seo.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${seo.googleAnalyticsId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        {/* Google Tag Manager (GTM) */}
        {seo.googleTagManagerId && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${seo.googleTagManagerId}');
            `}
          </Script>
        )}

        {/* Meta Pixel Code */}
        {seo.metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${seo.metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
