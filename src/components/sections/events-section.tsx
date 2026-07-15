import { Section, SectionContainer, SectionTitle } from "@/components/public-section";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendees: number;
  status: "upcoming" | "ongoing" | "past";
}

function EventCard({ id, title, description, date, location, attendees, status }: EventCardProps) {
  const navigate = useNavigate();
  const statusColors = {
    upcoming: "bg-blue-500/10 text-blue-600 border-blue-200",
    ongoing: "bg-green-500/10 text-green-600 border-green-200",
    past: "bg-gray-500/10 text-gray-600 border-gray-200",
  };

  const statusLabels = {
    upcoming: "Próximo",
    ongoing: "Em Andamento",
    past: "Realizado",
  };

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 flex flex-col">
      <div className="h-40 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <Calendar className="absolute top-4 right-4 h-12 w-12 text-primary/30" />
        </div>
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </CardTitle>
            <Badge className={`w-fit ${statusColors[status]}`}>
              {statusLabels[status]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 flex-1">
        <CardDescription className="line-clamp-2 mb-4">{description}</CardDescription>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{attendees}+ confirmados</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-border/30 pt-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full group/btn hover:border-primary hover:bg-primary/5"
          onClick={() => navigate({ to: "/eventos" })}
        >
          Detalhes
          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export function EventsSection() {
  const events: EventCardProps[] = [
    {
      id: "1",
      title: "Treinamento de Resposta a Emergências",
      description: "Simulado de resposta integrada com múltiplas equipes e cenários complexos",
      date: "15 de Agosto, 2024",
      location: "Centro de Treinamento - Uiraúna",
      attendees: 120,
      status: "upcoming",
    },
    {
      id: "2",
      title: "Conferência de Segurança Pública",
      description: "Encontro de profissionais para discussão de políticas e melhores práticas",
      date: "22 de Agosto, 2024",
      location: "Auditório Municipal",
      attendees: 200,
      status: "upcoming",
    },
    {
      id: "3",
      title: "Certificação Internacional em Resgate",
      description: "Certificação reconhecida internacionalmente em técnicas avançadas de resgate",
      date: "01 de Setembro, 2024",
      location: "Campus Regional",
      attendees: 80,
      status: "upcoming",
    },
  ];

  return (
    <Section>
      <SectionContainer>
        <SectionTitle
          title="Próximos Eventos"
          subtitle="Acompanhe nossa agenda de capacitação e eventos importantes"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button size="lg" variant="outline">
            Ver Todos os Eventos
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </SectionContainer>
    </Section>
  );
}
