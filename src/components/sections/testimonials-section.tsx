import { Section, SectionContainer, SectionTitle } from "@/components/public-section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

function TestimonialCard({ quote, author, role, rating }: TestimonialCardProps) {
  return (
    <Card className="border-border/50 hover:border-primary/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 bg-gradient-to-br from-primary/20 to-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {author
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{author}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-4">
          {Array.from({ length: rating }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground italic leading-relaxed">"{quote}"</p>
      </CardContent>
    </Card>
  );
}

export function TestimonialsSection() {
  const testimonials: TestimonialCardProps[] = [
    {
      quote:
        "O sistema SIGA transformou a forma como gerenciamos nossas operações. Agora temos visibilidade total e eficiência muito maior.",
      author: "Major Carlos Silva",
      role: "Coordenador Operacional",
      rating: 5,
    },
    {
      quote:
        "Excelente platform de gestão. A equipe de suporte é sempre atenciosa e os cursos oferecidos são de qualidade excepcional.",
      author: "Sgt. Ana Marques",
      role: "Instrutora Certificada",
      rating: 5,
    },
    {
      quote:
        "Finalmente conseguimos padronizar nossos processos. A ABCUNA está no caminho certo com este sistema inteligente.",
      author: "Capitão Pedro Santos",
      role: "Chefe Administrativo",
      rating: 5,
    },
  ];

  return (
    <Section className="bg-foreground/2">
      <SectionContainer>
        <SectionTitle
          title="Depoimentos"
          subtitle="O que nossos profissionais dizem sobre a ABCUNA"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </SectionContainer>
    </Section>
  );
}
