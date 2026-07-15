import { createFileRoute, Navigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Mail, Heart, ChevronLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AbcunaBrand } from "@/components/abcuna-brand";
import authBg from "@/assets/auth-bg.jpg";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/recuperar-senha")({
  component: PasswordRecoveryPage,
  head: () => ({ meta: [{ title: "Recuperar Senha · ABCUNA" }] }),
});

function PasswordRecoveryPage() {
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
              Segurança da Conta
            </p>
            <h1 className="mt-4 text-5xl font-black leading-tight">
              Recupere seu
              <br />
              <span className="text-primary">acesso.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Siga os passos para redefinir sua senha de forma segura e recuperar acesso à sua conta.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Heart className="h-4 w-4 text-primary" />
            <span>Processo rápido e seguro</span>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <AbcunaBrand size="md" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Recuperar Senha</h2>
            <p className="text-sm text-muted-foreground">
              Informe seu e-mail para receber instruções de recuperação
            </p>
          </div>

          <PasswordRecoveryForm />

          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordRecoveryForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "code" | "reset">("email");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSendRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/recuperar-senha`,
    });

    setLoading(false);

    if (error) {
      toast.error("Erro ao enviar e-mail", { description: error.message });
      return;
    }

    toast.success("E-mail enviado!", {
      description: "Verifique sua caixa de entrada para instruções de recuperação.",
    });
    setStep("reset");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      toast.error("Erro ao redefinir senha", { description: error.message });
      return;
    }

    toast.success("Senha redefinida com sucesso!", {
      description: "Você será redirecionado para o login.",
    });

    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  };

  if (step === "email") {
    return (
      <form onSubmit={handleSendRecovery} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <p className="text-xs text-muted-foreground">
            Informe o e-mail associado à sua conta
          </p>
        </div>

        <Button type="submit" disabled={loading} className="w-full glow-red">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          Enviar Link de Recuperação
        </Button>
      </form>
    );
  }

  if (step === "reset") {
    return (
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 p-4 text-sm text-green-600 dark:text-green-400 flex gap-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Link enviado!</p>
            <p className="text-xs mt-1">Verifique seu e-mail para o link de redefinição de senha.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-pwd">Nova Senha</Label>
          <div className="relative">
            <Input
              id="new-pwd"
              type={show ? "text" : "password"}
              placeholder="Crie uma nova senha"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-pwd">Confirmar Senha</Label>
          <div className="relative">
            <Input
              id="confirm-pwd"
              type={showConfirm ? "text" : "password"}
              placeholder="Repita sua nova senha"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

        <Button type="submit" disabled={loading} className="w-full glow-red">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Redefinir Senha"
          )}
        </Button>
      </form>
    );
  }
}
