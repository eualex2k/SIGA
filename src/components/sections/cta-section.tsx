import { Section, SectionContainer } from "@/components/public-section";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function CTASection() {
  const navigate = useNavigate();

  const benefits = [
    "Acesso 24/7 ao portal administrativo",
    "Certificados reconhecidos internacionalmente",
    "Treinamento especializado contínuo",
    "Comunidade de profissionais de segurança",
  ];

  return (
    <Section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
      <div className="absolute -top-40 right-0 h-80 w-80 bg-primary/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-40 left-0 h-80 w-80 bg-primary/10 rounded-full blur-3xl opacity-50" />

      <SectionContainer className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Pronto para fazer parte da ABCUNA?
              </h2>
              <p className="text-lg text-muted-foreground">
                Junte-se a centenas de profissionais de segurança que confiam em nosso sistema para
                gerenciar suas operações e desenvolvimentos profissionais.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="glow-red"
                onClick={() => navigate({ to: "/cadastro" })}
              >
                Comece Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: "/quem-somos" })}
              >
                Saiba Mais
              </Button>
            </div>
          </div>

          {/* Right Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 p-6 rounded-xl border border-primary/20 bg-card hover:bg-card/80 transition-colors">
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Associados Ativos</p>
            </div>
            <div className="space-y-2 p-6 rounded-xl border border-primary/20 bg-card hover:bg-card/80 transition-colors">
              <p className="text-3xl font-bold text-primary">20+</p>
              <p className="text-sm text-muted-foreground">Anos de Excelência</p>
            </div>
            <div className="space-y-2 p-6 rounded-xl border border-primary/20 bg-card hover:bg-card/80 transition-colors">
              <p className="text-3xl font-bold text-primary">10K+</p>
              <p className="text-sm text-muted-foreground">Certificados Emitidos</p>
            </div>
            <div className="space-y-2 p-6 rounded-xl border border-primary/20 bg-card hover:bg-card/80 transition-colors">
              <p className="text-3xl font-bold text-primary">50+</p>
              <p className="text-sm text-muted-foreground">Municípios Atendidos</p>
            </div>
          </div>
        </div>
      </SectionContainer>
    </Section>
  );
}
