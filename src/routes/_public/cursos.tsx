import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionContainer, SectionTitle } from "@/components/public-section";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, ArrowRight, Filter } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export const Route = createFileRoute("/_public/cursos")({
  component: CoursesPage,
  head: () => ({
    meta: [
      {
        title: "Cursos - ABCUNA",
      },
      {
        name: "description",
        content: "Conheça todos os cursos profissionais de segurança e emergência oferecidos pela ABCUNA.",
      },
    ],
  }),
});

const allCourses = [
  {
    id: "1",
    title: "Primeiros Socorros Básico",
    description: "Aprenda as técnicas essenciais de primeiros socorros para salvar vidas em emergências",
    category: "Socorros",
    hours: 20,
    students: 450,
    level: "iniciante" as const,
  },
  {
    id: "2",
    title: "Brigada de Incêndio",
    description: "Capacitação completa em combate a incêndios e prevenção de sinistros",
    category: "Brigada",
    hours: 40,
    students: 320,
    level: "intermediario" as const,
  },
  {
    id: "3",
    title: "Resgate Avançado",
    description: "Técnicas especializadas de resgate em cenários complexos e de alto risco",
    category: "Resgate",
    hours: 60,
    students: 180,
    level: "avancado" as const,
  },
  {
    id: "4",
    title: "RCP - Ressuscitação Cardiopulmonar",
    description: "Treinamento intensivo em técnicas de RCP com equipamentos modernos",
    category: "Socorros",
    hours: 8,
    students: 280,
    level: "iniciante" as const,
  },
  {
    id: "5",
    title: "Legislação e Segurança Pública",
    description: "Estudo das leis e regulamentações aplicáveis à segurança pública",
    category: "Legislação",
    hours: 30,
    students: 120,
    level: "intermediario" as const,
  },
  {
    id: "6",
    title: "Direção Defensiva",
    description: "Técnicas avançadas de condução em situações emergenciais",
    category: "Operacional",
    hours: 15,
    students: 200,
    level: "intermediario" as const,
  },
];

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  hours: number;
  students: number;
  level: "iniciante" | "intermediario" | "avancado";
}

function CourseCard({ title, description, category, hours, students, level }: CourseCardProps) {
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
        <div className="flex items-start justify-between gap-4">
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
        >
          Saiba Mais
          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function CoursesPage() {
  const [level, setLevel] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();

  const filteredCourses = allCourses.filter((course) => {
    if (level && course.level !== level) return false;
    if (category && course.category !== category) return false;
    return true;
  });

  const categories = Array.from(new Set(allCourses.map((c) => c.category)));
  const levels = ["iniciante", "intermediario", "avancado"];

  return (
    <div className="w-full">
      {/* Hero */}
      <Section className="bg-gradient-to-br from-primary/5 to-background py-16">
        <SectionContainer>
          <SectionTitle
            title="Cursos Profissionais"
            subtitle="Capacitação especializada em segurança e emergência"
          />
        </SectionContainer>
      </Section>

      {/* Filters and Courses */}
      <Section>
        <SectionContainer>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os níveis</SelectItem>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum curso encontrado com os filtros selecionados.</p>
            </div>
          )}
        </SectionContainer>
      </Section>
    </div>
  );
}
