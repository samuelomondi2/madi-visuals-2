// "use client";

// import { useEffect, useState } from "react";
// import Navbar from "./navbar";
// import Hero from "./hero";
// import HeroVideo from "./hero-video";
// import Footer from "./footer";

// type HeroVideoResponse = {
//   id: number;
//   url: string;
//   updated_at: string;
// };

// export default function HomePage() {
//   const [heroVideo, setHeroVideo] = useState<HeroVideoResponse | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let interval: ReturnType<typeof setInterval>;

//     async function loadHeroVideo() {
//       try {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/api/hero-video`,
//           { cache: "no-store" }
//         );

//         if (!res.ok) return;

//         const data = await res.json();

//         // console.log("debug", data.hero_video_url.url);

//         if (data?.hero_video_url) {
//           setHeroVideo((prev) => {
//             console.log("Current hero video URL:", heroVideo?.url);
//             if (prev?.url !== data.hero_video_url.url) {
//               return data.hero_video_url;
//             }
//             return prev;
//           });
//         }
//       } catch (err) {
//         console.error("Failed to fetch hero video", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadHeroVideo();
//     interval = setInterval(loadHeroVideo, 30000); // refresh every 30s

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <>
//       <Navbar />
//       <main className="w-full mt-12">
//         <Hero />

//         {loading || !heroVideo ? (
//           <img
//             src="/Herovideo.MOV"
//             alt="Hero Placeholder"
//             className="w-full h-auto mt-8"
//           />
//         ) : (
//           <HeroVideo
//             key={heroVideo.url} // force reload if URL changes
//             videoUrl={heroVideo.url}
//             posterUrl="/hero.webp"
//           />
//         )}

//         <Footer />
//       </main>
//     </>
//   );
// }