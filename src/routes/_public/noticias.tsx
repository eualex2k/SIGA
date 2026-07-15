import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionContainer, SectionTitle } from "@/components/public-section";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

export const Route = createFileRoute("/_public/noticias")({
  component: NewsPage,
  head: () => ({
    meta: [
      {
        title: "Notícias - ABCUNA",
      },
      {
        name: "description",
        content: "Acompanhe as últimas notícias e atualizações da ABCUNA.",
      },
    ],
  }),
});

const articles = [
  {
    id: "1",
    title: "ABCUNA recebe certificação internacional em protocolos de resgate",
    description:
      "A Associação conquistou reconhecimento internacional pela implementação de protocolos avançados de resgate e segurança.",
    date: "15 de Julho, 2024",
    category: "Certificação",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "2",
    title: "Novo sistema SIGA revoluciona gestão administrativa da ABCUNA",
    description:
      "Com a implementação do Sistema Integrado de Gestão, os processos administrativos ganham eficiência e transparência.",
    date: "10 de Julho, 2024",
    category: "Tecnologia",
    excerpt:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    id: "3",
    title: "Bombeiros civis realizam atendimento emergencial bem-sucedido",
    description: "Equipe ABCUNA responde com sucesso a situação crítica de emergência no município.",
    date: "05 de Julho, 2024",
    category: "Operações",
    excerpt:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    id: "4",
    title: "Expansão de cursos profissionais para a região sul",
    description:
      "ABCUNA expande seus cursos de capacitação para novos municípios da região.",
    date: "01 de Julho, 2024",
    category: "Cursos",
    excerpt:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
];

interface ArticleCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
}

function ArticleCard({ title, description, date, category }: ArticleCardProps) {
  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 flex flex-col">
      <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
        <Badge className="absolute top-4 right-4 bg-primary/20 text-primary border-0">
          {category}
        </Badge>
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-xs">
          <Calendar className="h-3 w-3" />
          {date}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3 flex-1">
        <CardDescription className="line-clamp-3">{description}</CardDescription>
      </CardContent>
      <CardFooter className="border-t border-border/30 pt-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full group/btn hover:border-primary hover:bg-primary/5"
        >
          Ler Mais
          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function NewsPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <Section className="bg-gradient-to-br from-primary/5 to-background py-16">
        <SectionContainer>
          <SectionTitle
            title="Notícias"
            subtitle="Últimas atualizações e acontecimentos da ABCUNA"
          />
        </SectionContainer>
      </Section>

      {/* Articles */}
      <Section>
        <SectionContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} {...article} />
            ))}
          </div>
        </SectionContainer>
      </Section>
    </div>
  );
}
