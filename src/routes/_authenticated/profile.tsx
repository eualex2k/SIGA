import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        subtitle="Atualize seu nome, telefone ou avatar para manter os dados da conta sincronizados."
      />

      <Card>
        <CardHeader>
          <CardTitle>Dados de acesso</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
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

      <Card>
        <CardHeader>
          <CardTitle>Informações públicas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
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
          <div className="space-y-2 sm:col-span-2">
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
          <Button
            onClick={() => updateProfile.mutate()}
            disabled={updateProfile.isLoading || isLoading}
          >
            Salvar alterações
          </Button>
        </div>
      </Card>
    </div>
  );
}
