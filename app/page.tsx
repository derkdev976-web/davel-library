import { Hero3D } from "@/components/3d/hero-3d"
import { FloatingBooks } from "@/components/3d/floating-books"
import { FeatureCards } from "@/components/home/feature-cards"
import { ImpactStats } from "@/components/home/impact-stats"
import { ServiceHoursSection } from "@/components/home/service-hours"
import { ContactSection } from "@/components/home/contact-section"
import { NewsSection } from "@/components/home/news-section"
import { ServicesSection } from "@/components/home/services-section"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      <main>
        <Hero3D />
        <div className="relative">
          <FloatingBooks />
          <FeatureCards />
        </div>
        <ServicesSection />
        <ImpactStats />
        
        {/* Additional sections */}
        <section className="py-16 bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ServiceHoursSection />
              <ContactSection />
            </div>
          </div>
        </section>
        
        <NewsSection />
      </main>
      <Footer />
    </div>
  )
}
