import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { ProductFeatures } from "@/components/product-features";
import { Availability } from "@/components/availability";
import { HowItWorks } from "@/components/how-it-works";
import { Testimonials } from "@/components/testimonials";
import { SupplierBenefits } from "@/components/pricing";
import { CtaSection, Footer } from "@/components/cta-footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <ProductFeatures />
      <Availability />
      <HowItWorks />
      <Testimonials />
      <SupplierBenefits />
      <CtaSection />
      <Footer />
    </main>
  );
}
