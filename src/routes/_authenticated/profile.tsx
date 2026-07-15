import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Perfil · ABCUNA" }] }),
});

type ProfileData = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  role?: string | null;
  permissions?: string | null;
};

type ProfileForm = {
  id: string;
  email: string | null;
  full_name: string;
  phone: string;
  avatar_url: string;
};

function ProfilePage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<ProfileData | null>(["profile"], async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Não foi possível carregar o usuário.");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, phone, avatar_url, updated_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError && profileError.message !== "Results contain 0 rows") {
      throw profileError;
    }

    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name ?? (user.user_metadata?.full_name as string | null) ?? "",
      phone: profile?.phone ?? "",
      avatar_url: profile?.avatar_url ?? "",
      updated_at: profile?.updated_at ?? user?.created_at ?? null,
      role:
        (profile as any)?.role ??
        (user.user_metadata?.role_title as string | undefined) ??
        (user.user_metadata?.role as string | undefined) ??
        null,
      permissions:
        Array.isArray(user.user_metadata?.permissions)
          ? (user.user_metadata.permissions as string[]).join(", ")
          : (user.user_metadata?.permissions as string | null) ?? null,
    };
  });

  const [form, setForm] = useState<ProfileForm>({
    id: "",
    email: null,
    full_name: "",
    phone: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (data) {
      setForm({
        id: data.id,
        email: data.email,
        full_name: data.full_name ?? "",
        phone: data.phone ?? "",
        avatar_url: data.avatar_url ?? "",
      });
    }
  }, [data]);

  const role = useMemo(
    () => data?.role ?? "Não definido",
    [data],
  );

  const permissionsText = useMemo(
    () => data?.permissions ?? "Sem permissões específicas informadas",
    [data],
  );

  const updateProfile = useMutation(async () => {
    if (!form.id) {
      throw new Error("Usuário inválido.");
    }

    const [{ error: authError }, { error: profileError }] = await Promise.all([
      supabase.auth.updateUser({ data: { full_name: form.full_name } }),
      supabase.from("profiles").upsert(
        {
          id: form.id,
          email: form.email,
          full_name: form.full_name || null,
          phone: form.phone || null,
          avatar_url: form.avatar_url || null,
        },
        { returning: "representation" },
      ),
    ]);

    if (authError) throw authError;
    if (profileError) throw profileError;
  }, {
    onSuccess: () => {
      toast.success("Perfil atualizado");
      queryClient.invalidateQueries(["profile"]);
    },
    onError: (error: any) => {
      toast.error("Falha ao atualizar perfil", { description: error?.message });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meu perfil"
        subtitle="Atualize seus contatos e informações de conta com segurança."
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>Minha conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-6 pb-6 pt-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <Avatar className="h-24 w-24 rounded-full bg-primary/10 text-primary">
                {data?.avatar_url ? (
                  <AvatarImage src={data.avatar_url} alt={data.full_name ?? "Avatar"} />
                ) : (
                  <AvatarFallback>{data?.full_name ? data.full_name.slice(0, 2).toUpperCase() : "AB"}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="text-lg font-semibold text-foreground">{data?.full_name ?? "Operador"}</p>
                <p className="text-sm text-muted-foreground">{data?.email}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-border/60 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Cargo</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{role}</p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Permissões</p>
              <p className="mt-2 text-sm text-foreground">{permissionsText}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>Dados de acesso</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label>Usuário</Label>
                <Input value={form.email ?? ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Última atualização</Label>
                <Input value={data?.updated_at ? fmtDate(data.updated_at) : "—"} disabled />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>Informações públicas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome completo</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar_url">URL do avatar</Label>
                <Input
                  id="avatar_url"
                  value={form.avatar_url}
                  onChange={(event) => setForm({ ...form, avatar_url: event.target.value })}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
            <div className="flex justify-end border-t border-border/60 bg-background/50 p-4">
              <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isLoading || isLoading}>
                Salvar alterações
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
