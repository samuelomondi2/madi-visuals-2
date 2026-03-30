'use client';

type HeroVideoProps = {
  videoUrl: string;
  posterUrl?: string;
};

export default function HeroVideo({ videoUrl, posterUrl }: HeroVideoProps) {
  return (
    <div className="w-full h-80 relative">
      <video
        src={videoUrl}
        poster={posterUrl}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
}

