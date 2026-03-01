'use client';

interface HeroVideoProps {
  videoUrl: string;
  posterUrl?: string;
}

export default function HeroVideo({ videoUrl, posterUrl }: HeroVideoProps) {
  if (!videoUrl) return null;

  return (
    <div className="w-full h-[60vh] relative overflow-hidden">
      <video
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        poster={posterUrl}
        className="w-full h-full object-cover"
      />
    </div>
  );
}