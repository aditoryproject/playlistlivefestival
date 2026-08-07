import type { Metadata } from 'next';
import './globals.css';
import { getSiteConfig } from '@/lib/config';
import PixelScripts from '@/components/PixelScripts';
import { generateMusicEventSchema } from '@/lib/schema';

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig();

  return {
    title: config.metaTitle,
    description: config.metaDescription,
    keywords: config.metaKeywords,
    alternates: {
      canonical: config.canonicalUrl,
    },
    openGraph: {
      title: config.ogTitle || config.metaTitle,
      description: config.ogDescription || config.metaDescription,
      url: config.canonicalUrl,
      siteName: `${config.eventTitleFirst} ${config.eventTitleSecond}`,
      images: [
        {
          url: config.ogImage,
          width: 1200,
          height: 630,
          alt: config.ogTitle || config.metaTitle,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.ogTitle || config.metaTitle,
      description: config.ogDescription || config.metaDescription,
      images: [config.ogImage],
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
