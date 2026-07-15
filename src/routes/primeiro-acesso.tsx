import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, CheckCircle2, Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AbcunaBrand } from "@/components/abcuna-brand";
import authBg from "@/assets/auth-bg.jpg";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/primeiro-acesso")({
  component: FirstAccessPage,
  head: () => ({ meta: [{ title: "Primeiro Acesso · ABCUNA" }] }),
});

function FirstAccessPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(!!data.session);
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authenticated) return <Navigate to="/" replace />;

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={authBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-primary/30" />
        <div className="tactical-grid absolute inset-0 opacity-30" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <AbcunaBrand size="lg" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Bem-vindo
            </p>
            <h1 className="mt-4 text-5xl font-black leading-tight">
              Complete seu
              <br />
              <span className="text-primary">perfil.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Você foi convidado para fazer parte da ABCUNA. Configure sua senha e complete
              suas informações para iniciar.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Heart className="h-4 w-4 text-primary" />
            <span>Bem-vindo ao time de operadores</span>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-12 sm:px-12 overflow-y-auto">
        <div className="w-full max-w-md py-6">
          <div className="mb-8 lg:hidden">
            <AbcunaBrand size="md" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Primeiro Acesso</h2>
            <p className="text-sm text-muted-foreground">
              Configure sua conta para começar a usar o sistema
            </p>
          </div>

          <FirstAccessForm onSuccess={() => navigate({ to: "/", replace: true })} />

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Já tem acesso?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FirstAccessForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [step, setStep] = useState<"info" | "password" | "confirm">("info");

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName || !phone) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    setStep("password");
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }

    if (!agreeTerms) {
      toast.error("Você precisa aceitar os termos de uso");
      return;
    }

    setStep("confirm");
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate account setup
    setTimeout(() => {
      toast.success("Conta configurada com sucesso!", {
        description: "Bem-vindo à ABCUNA!",
      });
      setLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <>
      {step === "info" && (
        <form onSubmit={handleNextStep} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(83) 98765-4321"
            />
          </div>

          <Button type="submit" className="w-full glow-red">
            Próximo
          </Button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handleSetPassword} className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-xs text-blue-600 dark:text-blue-400">
              Agora defina uma senha segura para sua conta
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="pwd">Senha</Label>
            <div className="relative">
              <Input
                id="pwd"
                type={show ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha segura"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Mín. 8 caracteres com letras, números
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pwd-confirm">Confirmar Senha</Label>
            <div className="relative">
              <Input
                id="pwd-confirm"
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita sua senha"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms-fa"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(!!checked)}
            />
            <Label htmlFor="terms-fa" className="text-xs font-normal cursor-pointer">
              Aceito os{" "}
              <Link to="/termos-de-uso" className="text-primary hover:underline">
                termos de uso
              </Link>{" "}
              e a{" "}
              <Link to="/politica-de-privacidade" className="text-primary hover:underline">
                política de privacidade
              </Link>
            </Label>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep("info")}
            >
              Voltar
            </Button>
            <Button type="submit" className="flex-1 glow-red">
              Continuar
            </Button>
          </div>
        </form>
      )}

      {step === "confirm" && (
        <form onSubmit={handleFinish} className="space-y-6">
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-sm text-green-600 dark:text-green-400">
              <p className="font-semibold mb-2">Informações revisadas:</p>
              <ul className="space-y-1 text-xs">
                <li>✓ E-mail: {email}</li>
                <li>✓ Nome: {fullName}</li>
                <li>✓ Telefone: {phone}</li>
                <li>✓ Senha: Configurada</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="bg-foreground/5 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">Próximos passos:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ Você receberá instruções por e-mail</li>
              <li>✓ Acesso ao portal será ativado imediatamente</li>
              <li>✓ Você poderá visualizar cursos e eventos disponíveis</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep("password")}
            >
              Voltar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 glow-red">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Finalizar Configuração"
              )}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
