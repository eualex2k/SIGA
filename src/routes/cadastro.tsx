import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, UserPlus, Heart, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AbcunaBrand } from "@/components/abcuna-brand";
import authBg from "@/assets/auth-bg.jpg";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cadastro")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Cadastro · ABCUNA" }] }),
});

function SignupPage() {
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
              Junte-se a nós
            </p>
            <h1 className="mt-4 text-5xl font-black leading-tight">
              Capacitação
              <br />
              <span className="text-primary">Profissional.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Registre-se para acessar cursos profissionais, certificações e participar de
              eventos da ABCUNA.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Heart className="h-4 w-4 text-primary" />
            <span>Segurança, sigilo e profissionalismo garantidos</span>
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
            <h2 className="text-2xl font-bold tracking-tight">Criar nova conta</h2>
            <p className="text-sm text-muted-foreground">
              Preencha os dados abaixo para se registrar
            </p>
          </div>

          <SignupForm onSuccess={() => navigate({ to: "/", replace: true })} />

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Já tem conta?{" "}
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

function SignupForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (pass: string) => {
    if (pass.length < 8) {
      return "A senha deve ter pelo menos 8 caracteres";
    }
    if (!/(?=.*[a-z])/.test(pass)) {
      return "A senha deve conter letras minúsculas";
    }
    if (!/(?=.*[A-Z])/.test(pass)) {
      return "A senha deve conter letras maiúsculas";
    }
    if (!/(?=.*\d)/.test(pass)) {
      return "A senha deve conter números";
    }
    return "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pwdError = validatePassword(password);
    if (pwdError) {
      setPasswordError(pwdError);
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

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name,
          cpf: cpf.replace(/\D/g, ""),
          phone: phone.replace(/\D/g, ""),
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    setLoading(false);

    if (error) {
      toast.error("Cadastro falhou", { description: error.message });
      return;
    }

    toast.success("Operador registrado", {
      description: "Acesso liberado. Bem-vindo à ABCUNA!",
    });
    onSuccess();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome completo"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            required
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-s">E-mail</Label>
        <Input
          id="email-s"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pwd-s">Senha</Label>
        <div className="relative">
          <Input
            id="pwd-s"
            type={show ? "text" : "password"}
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
            }}
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
        {passwordError && (
          <p className="text-xs text-red-600">{passwordError}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Mín. 8 caracteres, letras maiúsculas, minúsculas e números
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

      <div className="flex items-start space-x-2 pt-2">
        <Checkbox
          id="terms"
          checked={agreeTerms}
          onCheckedChange={(checked) => setAgreeTerms(!!checked)}
        />
        <Label htmlFor="terms" className="text-xs font-normal cursor-pointer">
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

      <Button type="submit" disabled={loading} className="w-full glow-red pt-6">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="mr-2 h-4 w-4" />
        )}
        Criar Conta
      </Button>

      <Alert className="border-primary/20 bg-primary/5">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-xs">
          Seus dados serão mantidos em sigilo e usados apenas para fins administrativos.
        </AlertDescription>
      </Alert>
    </form>
  );
}
