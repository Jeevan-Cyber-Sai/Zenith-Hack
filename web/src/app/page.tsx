import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import LeaderboardPreview from "@/components/landing/LeaderboardPreview";
import CTASection from "@/components/landing/CTASection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <LeaderboardPreview />
        <CTASection />
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>🎮 STUDEMY — Learn like a gamer. Level up for real.</p>
      </footer>
    </div>
  );
}
