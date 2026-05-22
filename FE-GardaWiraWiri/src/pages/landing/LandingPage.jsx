import React from "react";
import {
  Menu,
  X,
  Star,
  CheckCircle,
  Users,
  Clock,
  Heart,
  Shield,
} from "lucide-react";
import Header from "../../components/layout/Navbar";
import HeroSection from "../../components/section/HeroSection";
import FeaturesSection from "../../components/section/FeaturesSection";
import HowItWorksSection from "../../components/section/HowItWorksSection";
import ServicesSection from "../../components/section/ServicesSection";
import TestimonialsSection from "../../components/section/TestimonialsSection";
import CTASection from "../../components/section/CTASection";
import Footer from "../../components/layout/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#1C2939] font-sans antialiased selection:bg-[#7DCDB4]/30">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <ServicesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
