import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Configurações · ABCUNA" }] }),
});

function SettingsPage() {
  const { user } = useCurrentUser();
  const email = useMemo(() => user?.email ?? "-", [user]);
  const fullName = useMemo(
    () => (user?.user_metadata?.full_name as string | undefined) ?? "-",
    [user],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        subtitle="Ajuste preferências e revise dados da conta do ABCUNA SIS."
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6 pt-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Nome vinculado</Label>
              <Input value={fullName} disabled />
            </div>
            <div className="rounded-3xl border border-border/60 bg-background/80 p-4 text-sm text-muted-foreground">
              As configurações de conta são gerenciadas a partir do seu perfil de usuário. Para
              alterar dados pessoais, acesse o perfil.
            </div>
            <Button asChild>
              <Link to="/profile">Abrir perfil</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6 pt-4">
            <div className="space-y-2">
              <Label>Modo de exibição</Label>
              <Input value="Tema do sistema" disabled />
            </div>
            <div className="text-sm text-muted-foreground">
              O tema pode ser alternado rapidamente pelo ícone no cabeçalho. Esta tela mantém o
              painel de configurações consistente e pronto para futuras preferências.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
