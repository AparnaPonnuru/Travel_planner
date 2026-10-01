import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'VoyageAI — Intelligent Precision Trip Planner',
  description: 'AI-powered precision travel planning. Adaptive multi-city itineraries, realistic logistics, budget protection, and conversational modifications.',
  keywords: ['AI trip planner', 'luxury travel', 'itinerary generator', 'Kerala travel planner', 'personalized vacation', 'smart route optimizer'],
  openGraph: {
    title: 'VoyageAI — Intelligent Luxury AI Trip Planner',
    description: 'Tell us where you want to go and what you love. Our intelligent trip architect builds your personalized, budget-balanced itinerary.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
