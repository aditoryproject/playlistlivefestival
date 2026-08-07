import React from 'react';
import { getSiteConfig } from '@/lib/config';
import HeroSection from '@/components/HeroSection';
import CountdownTimer from '@/components/CountdownTimer';
import LineupSection from '@/components/LineupSection';
import VideoSection from '@/components/VideoSection';
import VenueMap from '@/components/VenueMap';
import SpotifyPlayer from '@/components/SpotifyPlayer';
import Footer from '@/components/Footer';
import VisitorTracker from '@/components/VisitorTracker';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  const config = getSiteConfig();

  return (
    <main className="min-h-screen flex flex-col justify-between bg-white text-zinc-900">
      <VisitorTracker />
      <div>
        {/* Main Hero View - Exact match to user image */}
        <HeroSection config={config} />

        {/* Optional Interactive Features toggled via CMS */}
        {config.showCountdown && config.targetDate && (
          <CountdownTimer targetDate={config.targetDate} />
        )}

        {/* Video Preview Teaser Section */}
        {config.showVideoSection && config.videoEmbedUrl && (
          <VideoSection
            title={config.videoTitle}
            subtitle={config.videoSubtitle}
            embedUrl={config.videoEmbedUrl}
            coverImage={config.videoCoverImage}
          />
        )}

        {/* Guest Stars Lineup (master toggle: config.showLineup) */}
        {config.showLineup && config.lineup && config.lineup.length > 0 && (
          <LineupSection
            lineup={config.lineup}
            phases={config.lineupPhases}
            activePhaseId={config.activePhaseId}
          />
        )}

        {config.showSpotify && config.spotifyEmbedUrl && (
          <SpotifyPlayer spotifyEmbedUrl={config.spotifyEmbedUrl} />
        )}

        {config.showVenueMap && (
          <VenueMap
            venueName={config.venueName}
            venueAddress={config.venueAddress}
            venueMapUrl={config.venueMapUrl}
          />
        )}
      </div>

      <Footer eventTitle={`${config.eventTitleFirst} ${config.eventTitleSecond}`} />
    </main>
  );
}
