import { Section, SectionContainer, SectionTitle } from "@/components/public-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItemProps {
  question: string;
  answer: string;
}

export function FAQSection() {
  const faqs: FAQItemProps[] = [
    {
      question: "Como faço para me cadastrar na plataforma?",
      answer:
        "Clique no botão 'Cadastrar' no topo da página, preencha seus dados (nome, CPF, e-mail e crie uma senha). Você receberá um e-mail de confirmação para validar sua conta.",
    },
    {
      question: "Quais cursos estão disponíveis?",
      answer:
        "Oferecemos cursos em Primeiros Socorros, Brigada de Incêndio, Resgate, Legislação e Segurança. Todos são reconhecidos e certificados. Acesse a página de Cursos para ver todas as opções.",
    },
    {
      question: "Como validar um certificado?",
      answer:
        "Acesse a página 'Validar' usando o código do seu certificado ou a carteirinha. O sistema verificará automaticamente a validade e exibirá o status.",
    },
    {
      question: "Posso recuperar minha senha?",
      answer:
        "Sim. Na página de login, clique em 'Esqueci minha senha' e siga as instruções enviadas para seu e-mail. Você receberá um link para criar uma nova senha.",
    },
    {
      question: "Como funciona o primeiro acesso?",
      answer:
        "Se você foi convidado pela ABCUNA, receberá um e-mail com instruções. Clique no link, defina sua senha, complete seu perfil e aceite os termos. Pronto para acessar!",
    },
    {
      question: "Há suporte disponível?",
      answer:
        "Sim! Entre em contato conosco através do formulário de contato ou envie um e-mail para contato@abcuna.org. Nossa equipe responde em até 24 horas.",
    },
  ];

  return (
    <Section>
      <SectionContainer className="max-w-3xl">
        <SectionTitle
          title="Perguntas Frequentes"
          subtitle="Respostas rápidas para dúvidas comuns"
        />
        <div className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </SectionContainer>
    </Section>
  );
}
