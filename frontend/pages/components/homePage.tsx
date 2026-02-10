import Footer from "./footer";
import Hero from "./hero";
import Navbar from "./navbar";

export default function HomePage() {
    return (
        <>
            <Navbar/>
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <Hero/>
                <Footer/>
            </div>
        </>
    )
}