import { Button } from "@/components/ui/button";
import { Section, SectionContainer, SectionTitle } from "./public-section";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <Section className="relative bg-gradient-to-br from-background via-primary/5 to-background overflow-hidden">
      <div className="absolute inset-0 tactical-grid opacity-20" />
      <div className="absolute -top-40 right-0 h-80 w-80 bg-primary/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-40 left-0 h-80 w-80 bg-primary/10 rounded-full blur-3xl opacity-50" />

      <SectionContainer className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/50 bg-primary/5">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Bem-vindo à ABCUNA</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight">
                Gestão completa.{" "}
                <span className="text-primary drop-shadow-[0_0_24px_oklch(0.58_0.22_28/0.5)]">
                  Resposta imediata.
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Sistema oficial da Associação de Bombeiros Civis de Uiraúna para o controle integrado de
                associados, mensalidades, finanças, estoque e escalas operacionais.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="glow-red"
                onClick={() => navigate({ to: "/login" })}
              >
                Acessar Portal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: "/quem-somos" })}
              >
                Conheça a ABCUNA
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4 text-sm text-muted-foreground border-t border-border/50">
              <div>
                <p className="font-semibold text-foreground">Bombeiros</p>
                <p>+500 operadores</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Eventos</p>
                <p>+1.000 anualmente</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Certificados</p>
                <p>+10.000 emitidos</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden lg:block">
            <div className="aspect-square rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-primary/30">ABCUNA</div>
                  <p className="text-muted-foreground">Sistema Integrado de Gestão</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </div>
      </SectionContainer>
    </Section>
  );
}
