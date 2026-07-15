import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionContainer, SectionTitle } from "@/components/public-section";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  QrCode,
  Award,
  Shield,
  Zap,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_public/validar")({
  component: ValidationPage,
  head: () => ({
    meta: [
      {
        title: "Validar Certificados - ABCUNA",
      },
      {
        name: "description",
        content: "Valide seus certificados, carteirinhas e credenciais da ABCUNA de forma rápida e segura.",
      },
    ],
  }),
});

interface ValidationResult {
  valid: boolean;
  status: "valid" | "invalid" | "expired" | "not-found";
  name: string;
  issueDate?: string;
  expiryDate?: string;
  code?: string;
  course?: string;
}

const mockDatabase: Record<string, ValidationResult> = {
  "CERT-2024-001": {
    valid: true,
    status: "valid",
    name: "João Silva",
    issueDate: "15 de Janeiro, 2024",
    expiryDate: "15 de Janeiro, 2026",
    code: "CERT-2024-001",
    course: "Primeiros Socorros Básico",
  },
  "CERT-2023-456": {
    valid: false,
    status: "expired",
    name: "Maria Santos",
    issueDate: "10 de Junho, 2021",
    expiryDate: "10 de Junho, 2024",
    code: "CERT-2023-456",
    course: "Brigada de Incêndio",
  },
  "CART-2024-789": {
    valid: true,
    status: "valid",
    name: "Pedro Costa",
    issueDate: "01 de Março, 2024",
    expiryDate: "01 de Março, 2025",
    code: "CART-2024-789",
    course: "Resgate Avançado",
  },
};

function ValidationResultCard({ result }: { result: ValidationResult | null }) {
  if (!result) return null;

  const statusConfig = {
    valid: {
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      borderColor: "border-green-200 dark:border-green-800",
      label: "Válido",
    },
    invalid: {
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
      borderColor: "border-red-200 dark:border-red-800",
      label: "Inválido",
    },
    expired: {
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      label: "Expirado",
    },
    "not-found": {
      icon: XCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-950",
      borderColor: "border-gray-200 dark:border-gray-800",
      label: "Não Encontrado",
    },
  };

  const config = statusConfig[result.status];
  const Icon = config.icon;

  if (result.status === "not-found") {
    return (
      <div
        className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-6 text-center`}
      >
        <Icon className={`h-12 w-12 mx-auto mb-3 ${config.color}`} />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Certificado não encontrado
        </h3>
        <p className="text-sm text-muted-foreground">
          O código informado não corresponde a nenhum documento em nossa base de dados.
          Verifique e tente novamente.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-6 space-y-4`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`h-8 w-8 ${config.color}`} />
          <h3 className="text-lg font-semibold text-foreground">{result.name}</h3>
        </div>
        <Badge className={`${config.color} bg-transparent border`}>
          {config.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-current border-opacity-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Código
          </p>
          <p className="text-sm font-mono text-foreground">{result.code}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Curso
          </p>
          <p className="text-sm text-foreground">{result.course}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Data de Emissão
          </p>
          <p className="text-sm text-foreground">{result.issueDate}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Validade
          </p>
          <p className="text-sm text-foreground">{result.expiryDate}</p>
        </div>
      </div>
    </div>
  );
}

interface TabProps {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

function ValidationPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [searched, setSearched] = useState(false);

  const tabs: TabProps[] = [
    {
      name: "Certificados",
      icon: Award,
      description: "Valide seus certificados de conclusão de cursos",
    },
    {
      name: "Carteirinhas",
      icon: Shield,
      description: "Verifique a validade de carteirinhas de operador",
    },
    {
      name: "Credenciais",
      icon: Zap,
      description: "Confirme credenciais e autorizações especiais",
    },
  ];

  const handleSearch = () => {
    setSearched(true);
    const foundResult = mockDatabase[code.toUpperCase()] || {
      valid: false,
      status: "not-found" as const,
      name: "",
    };
    setResult(foundResult);
  };

  const handleReset = () => {
    setCode("");
    setResult(null);
    setSearched(false);
  };

  return (
    <div className="w-full">
      {/* Hero */}
      <Section className="bg-gradient-to-br from-primary/5 to-background py-16">
        <SectionContainer>
          <SectionTitle
            title="Validar Documento"
            subtitle="Verifique a autenticidade e validade de seus certificados, carteirinhas e credenciais"
          />
        </SectionContainer>
      </Section>

      {/* Validation Section */}
      <Section>
        <SectionContainer className="max-w-2xl">
          <Tabs defaultValue="Certificados" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.name} value={tab.name}>
                  <tab.icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.name} value={tab.name} className="space-y-6 mt-6">
                {/* Info Card */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base">{tab.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{tab.description}</p>
                  </CardContent>
                </Card>

                {/* Search Form */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Buscar</CardTitle>
                    <CardDescription>
                      Digite o código do seu documento para validar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Código do Documento</Label>
                      <div className="flex gap-2">
                        <Input
                          id="code"
                          placeholder={`Ex: CERT-2024-001 ou CART-2024-789`}
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <Button
                          onClick={handleSearch}
                          disabled={!code.trim()}
                          className="glow-red"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* QR Scanner Placeholder */}
                    <div className="relative pt-2 border-t border-border/50">
                      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto pt-4">
                        <QrCode className="h-4 w-4" />
                        Ou escanear código QR
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Result */}
                {searched && (
                  <div className="space-y-4">
                    <ValidationResultCard result={result} />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleReset}
                    >
                      Fazer Nova Busca
                    </Button>
                  </div>
                )}

                {/* Examples */}
                {!searched && (
                  <Card className="border-border/50 bg-foreground/2">
                    <CardHeader>
                      <CardTitle className="text-base">Exemplos de Códigos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3">
                        Teste com um destes códigos válidos:
                      </p>
                      <div className="space-y-2">
                        {["CERT-2024-001", "CERT-2023-456", "CART-2024-789"].map(
                          (example) => (
                            <button
                              key={example}
                              onClick={() => {
                                setCode(example);
                              }}
                              className="block w-full text-left px-3 py-2 text-sm font-mono bg-background rounded border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
                            >
                              {example}
                            </button>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </SectionContainer>
      </Section>

      {/* Info Section */}
      <Section className="bg-foreground/2">
        <SectionContainer>
          <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="text-2xl font-bold text-center">Como funciona?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold">1. Digite o Código</h4>
                <p className="text-sm text-muted-foreground">
                  Informe o código presente em seu documento
                </p>
              </div>
              <div className="space-y-3 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold">2. Processamos</h4>
                <p className="text-sm text-muted-foreground">
                  Nossa base de dados valida instantaneamente
                </p>
              </div>
              <div className="space-y-3 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold">3. Resultado</h4>
                <p className="text-sm text-muted-foreground">
                  Receba confirmação imediata de validade
                </p>
              </div>
            </div>
          </div>
        </SectionContainer>
      </Section>
    </div>
  );
}
