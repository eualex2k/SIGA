import { Section, SectionContainer, SectionTitle } from "@/components/public-section";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  hours: number;
  students: number;
  level: "iniciante" | "intermediario" | "avancado";
}

function CourseCard({ id, title, description, category, hours, students, level }: CourseCardProps) {
  const navigate = useNavigate();
  const levelColors = {
    iniciante: "bg-blue-500/10 text-blue-600 border-blue-200",
    intermediario: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    avancado: "bg-red-500/10 text-red-600 border-red-200",
  };

  const levelLabels = {
    iniciante: "Iniciante",
    intermediario: "Intermediário",
    avancado: "Avançado",
  };

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 flex flex-col">
      <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <div className="text-6xl font-bold text-primary/30 text-center pt-8">
            {category.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="space-y-2 flex-1">
            <CardTitle className="group-hover:text-primary transition-colors">{title}</CardTitle>
            <Badge className={`w-fit ${levelColors[level]}`}>
              {levelLabels[level]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 flex-1">
        <CardDescription className="line-clamp-3">{description}</CardDescription>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t border-border/30 pt-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground w-full">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{hours}h</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{students}+ inscritos</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full group/btn hover:border-primary hover:bg-primary/5"
          onClick={() => navigate({ to: "/cursos" })}
        >
          Saiba Mais
          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export function CoursesSection() {
  const courses: CourseCardProps[] = [
    {
      id: "1",
      title: "Primeiros Socorros Básico",
      description: "Aprenda as técnicas essenciais de primeiros socorros para salvar vidas em emergências",
      category: "Socorros",
      hours: 20,
      students: 450,
      level: "iniciante",
    },
    {
      id: "2",
      title: "Brigada de Incêndio",
      description: "Capacitação completa em combate a incêndios e prevenção de sinistros",
      category: "Brigada",
      hours: 40,
      students: 320,
      level: "intermediario",
    },
    {
      id: "3",
      title: "Resgate Avançado",
      description: "Técnicas especializadas de resgate em cenários complexos e de alto risco",
      category: "Resgate",
      hours: 60,
      students: 180,
      level: "avancado",
    },
  ];

  return (
    <Section className="bg-foreground/2">
      <SectionContainer>
        <SectionTitle
          title="Cursos em Destaque"
          subtitle="Capacitação profissional reconhecida e certificada"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {courses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button size="lg" variant="outline">
            Ver Todos os Cursos
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </SectionContainer>
    </Section>
  );
}
