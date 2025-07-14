
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import BacktestSection from '@/components/BacktestSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import React from 'react';
import EquityDrawdownCharts from '@/components/platform/EquityDrawdownCharts'; // adjust path as needed
import CandlestickChart from '@/components/platform/CandlestickChart';
import ChartCarousel from '@/components/ChartCarousel';

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <BacktestSection />
      <ChartCarousel />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
