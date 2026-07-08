import Navbar from "../../components/public/Navbar";
import Hero from "../../components/public/Hero";
import StatsSection from "../../components/public/StatsSection";
import WorkflowSection from "../../components/public/WorkflowSection";
import CTASection from "../../components/public/CTASection";
import Footer from "../../components/public/Footer";

function Home() {
    return (
        <div className="public-body-wrap">
            <Navbar />
            <Hero />
            <StatsSection />
            <WorkflowSection />
            <CTASection />
            <Footer />
        </div>
    );
}

export default Home;
