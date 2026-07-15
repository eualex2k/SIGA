import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionContainer, SectionTitle } from "@/components/public-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Heart, Target, Users } from "lucide-react";

export const Route = createFileRoute("/_public/quem-somos")({
  component: AboutPage,
  head: () => ({
    meta: [
      {
        title: "Quem Somos - ABCUNA",
      },
      {
        name: "description",
        content: "Conheça a história, missão e valores da Associação de Bombeiros Civis de Uiraúna.",
      },
    ],
  }),
});

function AboutPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <Section className="bg-gradient-to-br from-primary/5 to-background py-20">
        <SectionContainer>
          <SectionTitle
            title="Quem Somos"
            subtitle="Conheça a história e missão da ABCUNA"
          />
        </SectionContainer>
      </Section>

      {/* History */}
      <Section>
        <SectionContainer>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold">Nossa História</h3>
              <p className="text-muted-foreground leading-relaxed">
                A Associação de Bombeiros Civis de Uiraúna foi fundada há mais de duas décadas com o objetivo de
                fortalecer a segurança pública e emergencial no município. Desde então, temos trabalhado
                incansavelmente para capacitar profissionais, atender emergências e promover cultura de prevenção.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ao longo dos anos, expandimos nossos serviços para toda a região, treinando mais de 500 associados e
                certificando milhares de profissionais. Hoje, o SIGA é a ferramenta que centraliza toda essa gestão
                e conhecimento acumulado.
              </p>
            </div>
            <div className="aspect-square rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-6xl font-bold text-primary/20">20+</div>
                <p className="text-muted-foreground">Anos de Tradição</p>
              </div>
            </div>
          </div>
        </SectionContainer>
      </Section>

      {/* Mission, Vision, Values */}
      <Section className="bg-foreground/2">
        <SectionContainer>
          <SectionTitle
            title="Nossa Identidade"
            subtitle="Missão, visão e valores que nos guiam"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="border-border/50 hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle>Missão</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Capacitar profissionais de segurança e promover resposta eficiente em situações de emergência,
                  salvaguardando vidas e patrimônio na comunidade.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>Visão</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Ser a referência em excelência na formação de profissionais de emergência e segurança pública na
                  região, reconhecida pela qualidade e inovação.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle>Valores</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Ética, responsabilidade, inovação, segurança, inclusão e compromisso com a comunidade.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </SectionContainer>
      </Section>

      {/* Achievements */}
      <Section>
        <SectionContainer>
          <SectionTitle
            title="Conquistas"
            subtitle="Resultados que comprovam nosso compromisso"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {[
              "500+ associados ativos e certificados",
              "10.000+ certificados emitidos desde a fundação",
              "50+ municípios com parcerias ativas",
              "1.000+ eventos de emergência atendidos",
              "Reconhecimento internacional em protocolos de resgate",
              "Sistema SIGA premiado como melhor solução administrativa",
            ].map((achievement, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground leading-relaxed">{achievement}</p>
              </div>
            ))}
          </div>
        </SectionContainer>
      </Section>
    </div>
  );
}
