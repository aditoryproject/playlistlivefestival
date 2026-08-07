import { SiteConfig } from './config';

export function generateMusicEventSchema(config: SiteConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: `${config.eventTitleFirst} ${config.eventTitleSecond}`,
    description: config.metaDescription,
    startDate: config.targetDate || '2026-11-14T15:00:00+07:00',
    endDate: '2026-11-15T23:59:00+07:00',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: config.venueName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: config.venueAddress,
        addressLocality: 'Bandung',
        addressRegion: 'Jawa Barat',
        addressCountry: 'ID',
      },
    },
    image: [config.ogImage],
    offers: {
      '@type': 'Offer',
      url: config.ticketUrl,
      price: '150000',
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
      validFrom: '2026-01-01T00:00:00+07:00',
    },
    performer: config.lineup.map((artist) => ({
      '@type': 'MusicGroup',
      name: artist.name,
      genre: artist.genre,
    })),
    organizer: {
      '@type': 'Organization',
      name: `${config.eventTitleFirst} ${config.eventTitleSecond} Organizer`,
      url: config.canonicalUrl,
    },
  };
}
