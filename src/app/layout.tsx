import type { Metadata } from 'next';
import './globals.css';
import { getSiteConfigAsync } from '@/lib/config';
import { generateMusicEventSchema } from '@/lib/schema';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfigAsync();
  const siteUrl = 'https://playlistlivefestival.letsplaymaker.com';

  let ogImageUrl = config.ogImage || '/og-image.jpg';
  if (ogImageUrl.startsWith('/')) {
    ogImageUrl = `${siteUrl}${ogImageUrl}`;
  }

  const title = config.ogTitle || config.metaTitle || 'Playlist Rewind 2026 - Bandung | 14-15 November 2026';
  const description = config.ogDescription || config.metaDescription || 'Beli tiket resmi Playlist Rewind 2026 Bandung pada 14-15 November 2026.';

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: config.metaKeywords,
    alternates: {
      canonical: config.canonicalUrl || siteUrl,
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: `${config.eventTitleFirst} ${config.eventTitleSecond}`,
      images: [
        {
          url: ogImageUrl,
          width: 1600,
          height: 900,
          alt: title,
          type: 'image/jpeg',
        },
      ],
      type: 'website',
      locale: 'id_ID',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/icon.png', type: 'image/png' },
      ],
      apple: [{ url: '/apple-icon.png' }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getSiteConfigAsync();
  const schemaJson = generateMusicEventSchema(config);
  const siteUrl = 'https://playlistlivefestival.letsplaymaker.com';

  let ogImageUrl = config.ogImage || '/og-image.jpg';
  if (ogImageUrl.startsWith('/')) {
    ogImageUrl = `${siteUrl}${ogImageUrl}`;
  }

  const title = config.ogTitle || config.metaTitle || 'Playlist Rewind 2026 - Bandung | 14-15 November 2026';
  const description = config.ogDescription || config.metaDescription || 'Beli tiket resmi Playlist Rewind 2026 Bandung pada 14-15 November 2026.';

  const cleanMetaPixelId = config.metaPixelId?.trim();
  const cleanTikTokPixelId = config.tikTokPixelId?.trim();
  const cleanGoogleTagId = config.googleTagId?.trim();
  const eventName = `${config.eventTitleFirst} ${config.eventTitleSecond}`;

  return (
    <html lang="id">
      <head>
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:secure_url" content={ogImageUrl} />
        <meta property="og:image:width" content="1600" />
        <meta property="og:image:height" content="900" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:alt" content={title} />
        <meta property="og:site_name" content={eventName} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImageUrl} />

        {/* 1. META / FACEBOOK PIXEL DIRECT IN HEAD FOR EVENT SETUP TOOL DETECTION */}
        {cleanMetaPixelId && (
          <script
            id="meta-pixel-head"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${cleanMetaPixelId}');
                fbq('track', 'PageView');
                fbq('track', 'ViewContent', { content_name: '${eventName}' });
              `,
            }}
          />
        )}

        {/* 2. TIKTOK PIXEL DIRECT IN HEAD */}
        {cleanTikTokPixelId && (
          <script
            id="tiktok-pixel-head"
            dangerouslySetInnerHTML={{
              __html: `
                !function (w, d, t) {
                  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var e=0;e<ttq.methods.length;e++)ttq.setAndDefer(ttq,ttq.methods[e]);ttq.instance=function(t){for(var e=ttq.methods[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._t[n]=+new Date;var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                  ttq.load('${cleanTikTokPixelId}');
                  ttq.page();
                  ttq.track('ViewContent', { content_name: '${eventName}' });
                }(window, document, 'ttq');
              `,
            }}
          />
        )}

        {/* 3. GOOGLE TAG (GA4 / GTM) DIRECT IN HEAD */}
        {cleanGoogleTagId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${cleanGoogleTagId}`}
            />
            <script
              id="google-analytics-head"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${cleanGoogleTagId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

        {/* 4. CUSTOM HEAD SCRIPTS */}
        {config.customHeadScripts && (
          <script
            id="custom-head-scripts"
            dangerouslySetInnerHTML={{ __html: config.customHeadScripts }}
          />
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
      </head>
      <body className="font-sans antialiased selection:bg-pink-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
