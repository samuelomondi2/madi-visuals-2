import Footer from "./footer";
import Hero from "./hero";
import HeroVideo from "./hero-video";
import Navbar from "./navbar";
import { useEffect, useState } from "react";

export default function HomePage() {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        async function loadVideo() {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files`);
          const data = await res.json();
          const latestVideo = data
            .filter((file: any) => file.file_type === "video")
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          setVideoUrl(latestVideo?.url || null);
        }
        loadVideo();
    }, []);

    return (
        <>
            <Navbar/>
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <Hero/>
                {videoUrl && <HeroVideo videoUrl={videoUrl} posterUrl="/hero.webp" />}
                <Footer/>
            </div>
        </>
    )
}
