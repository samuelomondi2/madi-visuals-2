import Image from "next/image";

type HeroContent = {
  title: string;
  name: string; 
  description: string;
  media_url: string | null;
};

async function getHeroContent(): Promise<HeroContent | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/hero`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function optimizeCloudinary(url: string, width = 1200) {
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,w_${width}/`
  );
}

export default async function Hero() {
  const content = await getHeroContent();
  if (!content) return null;

  // Split once at first space only
  const spaceIndex = content.name.indexOf(" ");

  const firstName =
    spaceIndex === -1
      ? content.name
      : content.name.slice(0, spaceIndex);

  const lastName =
    spaceIndex === -1
      ? ""
      : content.name.slice(spaceIndex + 1);

  return (
    <section className="bg-black">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-24 md:grid-cols-2">
        <div>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white md:text-5xl">
            {content.title}{" "}
            <span className="text-[#D4AF37]">
              {firstName}
            </span>
            {lastName && (
              <>
                <br />
                {lastName}.
              </>
            )}
          </h1>

          <p className="mt-6 max-w-lg text-neutral-400 leading-relaxed">
            {content.description}
          </p>
        </div>

        <div className="relative h-[420px] md:h-[600px] md:-mr-24">
          {content.media_url && content.media_url.startsWith("http") && (
            <Image
              src={optimizeCloudinary(content.media_url)}
              alt="Hero Image"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="rounded-xl object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}