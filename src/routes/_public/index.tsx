import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/sections/hero-section";
import { StatsSection } from "@/components/sections/stats-section";
import { ServicesSection } from "@/components/sections/services-section";
import { CoursesSection } from "@/components/sections/courses-section";
import { EventsSection } from "@/components/sections/events-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { FAQSection } from "@/components/sections/faq-section";
import { CTASection } from "@/components/sections/cta-section";

export const Route = createFileRoute("/_public/")({
  component: LandingPage,
  head: () => ({
    meta: [
      {
        title: "ABCUNA - Associação de Bombeiros Civis de Uiraúna",
      },
      {
        name: "description",
        content:
          "Sistema Integrado de Gestão da ABCUNA com cursos, eventos e certificações em segurança e emergência.",
      },
    ],
  }),
});

function LandingPage() {
  return (
    <div className="w-full">
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <CoursesSection />
      <EventsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
