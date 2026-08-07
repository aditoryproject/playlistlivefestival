import type { Metadata } from 'next';
import './globals.css';
import { getSiteConfig, getSiteConfigAsync } from '@/lib/config';
import PixelScripts from '@/components/PixelScripts';
import { generateMusicEventSchema } from '@/lib/schema';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfigAsync();
  const siteUrl = 'https://playlistlivefestival.letsplaymaker.com';

  let ogImageUrl = config.ogImage;
  if (!ogImageUrl) {
    ogImageUrl = `${siteUrl}/icon.png`;
  } else if (ogImageUrl.startsWith('/')) {
    ogImageUrl = `${siteUrl}${ogImageUrl}`;
  }

  const title = config.metaTitle || 'Playlist Rewind 2026 - Bandung | 14-15 November 2026';
  const description = config.metaDescription || 'Beli tiket resmi Playlist Rewind 2026 Bandung pada 14-15 November 2026.';

  return {
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
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = getSiteConfig();
  const schemaJson = generateMusicEventSchema(config);

  return (
    <html lang="id">
      <head>
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
