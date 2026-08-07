import type { Metadata } from 'next';
import './globals.css';
import { getSiteConfigAsync } from '@/lib/config';
import PixelScripts from '@/components/PixelScripts';
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
        <meta property="og:site_name" content={`${config.eventTitleFirst} ${config.eventTitleSecond}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImageUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
      </head>
      <body className="font-sans antialiased selection:bg-pink-500 selection:text-white">
        <PixelScripts
          metaPixelId={config.metaPixelId}
          tikTokPixelId={config.tikTokPixelId}
          googleTagId={config.googleTagId}
          customHeadScripts={config.customHeadScripts}
        />
        {children}
      </body>
    </html>
  );
}
