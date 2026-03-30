'use client';

type HeroVideoProps = { url: string };

export default function HeroVideo({ url }: HeroVideoProps) {
  return (
    <div className="w-full h-80 relative">
      <video
        src={url}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
}