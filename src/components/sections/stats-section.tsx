import { Section, SectionContainer, SectionTitle } from "@/components/public-section";
import { Users, Award, MapPin, TrendingUp, BookOpen } from "lucide-react";

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  number: string;
  label: string;
  description?: string;
}

function StatCard({ icon: Icon, number, label, description }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 hover:border-primary/50 hover:bg-card/50 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative space-y-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-4xl font-bold text-primary">{number}</p>
          <p className="font-semibold text-foreground mt-2">{label}</p>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatsSection() {
  const stats = [
    {
      icon: Users,
      number: "+500",
      label: "Associados",
      description: "Membros ativos na associação",
    },
    {
      icon: Award,
      number: "+10K",
      label: "Certificados",
      description: "Profissionais certificados",
    },
    {
      icon: TrendingUp,
      number: "+1K",
      label: "Eventos Anualmente",
      description: "Atendimentos operacionais",
    },
    {
      icon: MapPin,
      number: "+50",
      label: "Municípios",
      description: "Parceiros e atuação",
    },
  ];

  return (
    <Section className="bg-foreground/2">
      <SectionContainer>
        <SectionTitle
          title="Nossos Números"
          subtitle="Resultados que falam por si: décadas de excelência e compromisso com a segurança"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </SectionContainer>
    </Section>
  );
}
