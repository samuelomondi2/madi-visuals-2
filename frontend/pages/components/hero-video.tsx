"use client";

type HeroVideoProps = {
  videoUrl: string;
  posterUrl?: string;
};

export default function HeroVideo({ videoUrl, posterUrl }: HeroVideoProps) {
  if (!videoUrl) return null;

  return (
    <section className="bg-black py-12">
      <div className="mx-auto max-w-7xl px-6">
        <video
          controls
          poster={posterUrl}
          className="w-full rounded-xl object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
}