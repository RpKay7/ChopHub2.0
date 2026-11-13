
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ExperienceSection from "../components/ExperienceSection";
import SignatureExperiences from "../components/SignatureExperiences";
import MenuSection from "../components/MenuSection";
import ReviewsSection from "../components/ReviewsSection";
import DiningEnquiries from "../components/DiningEnquiries";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <ExperienceSection />
      <SignatureExperiences />
      <MenuSection />
      <ReviewsSection />
      <DiningEnquiries />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default Home;
