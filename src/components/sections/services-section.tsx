import { Section, SectionContainer, SectionTitle } from "@/components/public-section";
import { Heart, Shield, BookOpen, Zap, Users, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ServiceCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function ServiceCard({ icon: Icon, title, description }: ServiceCardProps) {
  return (
    <Card className="group relative overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

export function ServicesSection() {
  const services = [
    {
      icon: Heart,
      title: "Primeiros Socorros",
      description:
        "Treinamento especializado em técnicas de primeiros socorros para resposta rápida em emergências",
    },
    {
      icon: Shield,
      title: "Brigada de Incêndio",
      description:
        "Formação completa em combate a incêndios e segurança contra riscos de sinistro",
    },
    {
      icon: BookOpen,
      title: "Cursos Profissionais",
      description:
        "Capacitação contínua em temas de segurança, legislação e técnicas operacionais",
    },
    {
      icon: Zap,
      title: "Resposta Emergencial",
      description:
        "Atendimento 24/7 com equipes altamente treinadas para qualquer situação de emergência",
    },
    {
      icon: Users,
      title: "Consultoria",
      description:
        "Serviços de consultoria em segurança e planos de contingência para empresas e órgãos",
    },
    {
      icon: Lightbulb,
      title: "Projetos Sociais",
      description:
        "Iniciativas comunitárias para disseminar cultura de prevenção e segurança pública",
    },
  ];

  return (
    <Section>
      <SectionContainer>
        <SectionTitle
          title="Nossos Serviços"
          subtitle="Oferecemos soluções completas em segurança e emergência"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </SectionContainer>
    </Section>
  );
}
