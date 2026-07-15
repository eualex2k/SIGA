import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionContainer, SectionTitle } from "@/components/public-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_public/contato")({
  component: ContactPage,
  head: () => ({
    meta: [
      {
        title: "Contato - ABCUNA",
      },
      {
        name: "description",
        content: "Entre em contato com a ABCUNA. Tire suas dúvidas e conheça melhor nossos serviços.",
      },
    ],
  }),
});

interface ContactInfoProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string;
  details?: string;
}

function ContactInfo({ icon: Icon, title, content, details }: ContactInfoProps) {
  return (
    <div className="flex gap-4">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{content}</p>
        {details && <p className="text-xs text-muted-foreground mt-1">{details}</p>}
      </div>
    </div>
  );
}

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulating form submission
    setTimeout(() => {
      toast.success("Mensagem enviada com sucesso!", {
        description: "Responderemos em breve.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="w-full">
      {/* Hero */}
      <Section className="bg-gradient-to-br from-primary/5 to-background py-16">
        <SectionContainer>
          <SectionTitle
            title="Fale Conosco"
            subtitle="Estamos aqui para ajudar. Entre em contato via formulário ou informações abaixo"
          />
        </SectionContainer>
      </Section>

      {/* Contact Section */}
      <Section>
        <SectionContainer>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Endereço</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactInfo
                  icon={MapPin}
                  title="Localização"
                  content="Uiraúna, Paraíba, Brasil"
                  details="Brasil"
                />
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Telefone</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactInfo
                  icon={Phone}
                  title="Suporte"
                  content="+55 (83) 3212-3456"
                  details="Seg-Sex: 8h às 17h"
                />
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">E-mail</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactInfo
                  icon={Mail}
                  title="Contato"
                  content="contato@abcuna.org"
                  details="Resposta em até 24h"
                />
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Envie uma Mensagem</CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo e nossa equipe responderá em breve
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Seu nome"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Sobre o que é sua mensagem?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Digite sua mensagem aqui..."
                      rows={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full glow-red"
                  >
                    {loading ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </SectionContainer>
      </Section>

      {/* Business Hours */}
      <Section className="bg-foreground/2">
        <SectionContainer>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Horário de Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold text-foreground mb-3">Presencial</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Segunda a Sexta: 8:00 às 17:00</li>
                    <li>Sábado: 8:00 às 12:00</li>
                    <li>Domingo: Fechado</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-3">Online</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Segunda a Sexta: 8:00 às 20:00</li>
                    <li>Sábado: 9:00 às 18:00</li>
                    <li>Domingo: 10:00 às 16:00</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </SectionContainer>
      </Section>
    </div>
  );
}
