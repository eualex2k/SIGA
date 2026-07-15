import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, LogIn, Mail, Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AbcunaBrand } from "@/components/abcuna-brand";
import authBg from "@/assets/auth-bg.jpg";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Login · ABCUNA" }] }),
});

function LoginPage() {
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
              Central Operacional
            </p>
            <h1 className="mt-4 text-5xl font-black leading-tight">
              Gestão completa.
              <br />
              <span className="text-primary">Resposta imediata.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Sistema oficial da Associação de Bombeiros Civis de Uiraúna para o controle integrado
              de associados, mensalidades, finanças, estoque e escalas operacionais.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Heart className="h-4 w-4 text-primary" />
            <span>Acesso restrito a operadores autorizados</span>
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
            <h2 className="text-2xl font-bold tracking-tight">Acessar central</h2>
            <p className="text-sm text-muted-foreground">
              Identifique-se para iniciar a operação
            </p>
          </div>

          <LoginForm onSuccess={() => navigate({ to: "/", replace: true })} />

          <div className="mt-6 space-y-3 text-sm text-center">
            <p className="text-muted-foreground">
              Não tem conta?{" "}
              <Link
                to="/cadastro"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Criar nova conta
              </Link>
            </p>
            <Link
              to="/recuperar-senha"
              className="block font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Esqueci minha senha
            </Link>
          </div>

          <div className="mt-8 rounded-md border border-primary/30 bg-primary/5 p-4 text-xs text-muted-foreground">
            <p className="font-bold uppercase tracking-wider text-primary">Conta de demonstração</p>
            <p className="mt-1">
              E-mail: <span className="font-mono text-foreground">admin@abcuna.org</span>
            </p>
            <p>
              Senha: <span className="font-mono text-foreground">Abcuna@2026</span>
            </p>
            <p className="mt-2 opacity-80">Cadastre essa conta para acessar com permissão de administrador.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password 
    });
    setLoading(false);
    if (error) {
      toast.error("Acesso negado", { description: error.message });
      return;
    }
    toast.success("Acesso autorizado");
    onSuccess();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="operador@abcuna.org"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={show ? "text" : "password"}
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
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
      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember"
          checked={remember}
          onCheckedChange={(checked) => setRemember(!!checked)}
        />
        <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
          Lembrar-me neste dispositivo
        </Label>
      </div>
      <Button type="submit" disabled={loading} className="w-full glow-red">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="mr-2 h-4 w-4" />
        )}
        Iniciar operação
      </Button>
    </form>
  );
}
