import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Search, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate, maskCPF, maskPhone, initials, todayISO } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/associates")({
  component: AssociatesPage,
  head: () => ({ meta: [{ title: "Associados · ABCUNA" }] }),
});

type Associate = {
  id: string; full_name: string; cpf: string | null; phone: string | null; email: string | null;
  address: string | null; city: string | null; state: string | null; birth_date: string | null;
  join_date: string; status: "active" | "inactive" | "suspended"; monthly_fee: number; notes: string | null;
};

function AssociatesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Associate | null>(null);
  const [open, setOpen] = useState(false);

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["associates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("associates").select("*").order("full_name");
      if (error) throw error;
      return data as Associate[];
    },
  });

  const filtered = useMemo(() => {
    return list.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return a.full_name.toLowerCase().includes(s) || (a.cpf ?? "").includes(s) || (a.phone ?? "").includes(s);
      }
      return true;
    });
  }, [list, search, statusFilter]);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("associates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["associates"] }); toast.success("Associado removido"); },
    onError: (e: any) => toast.error("Falha", { description: e.message }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Associados"
        subtitle={`${list.length} cadastrados · ${list.filter((a) => a.status === "active").length} ativos`}
        icon={<Users className="h-5 w-5" />}
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button className="glow-red"><Plus className="mr-2 h-4 w-4" /> Novo associado</Button>
            </DialogTrigger>
            <AssociateDialog editing={editing} onDone={() => { setOpen(false); setEditing(null); qc.invalidateQueries({ queryKey: ["associates"] }); }} />
          </Dialog>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nome, CPF ou telefone…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="suspended">Suspensos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Associado</TableHead>
                <TableHead className="hidden md:table-cell">Contato</TableHead>
                <TableHead className="hidden lg:table-cell">Entrada</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Mensalidade</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">Carregando…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">Nenhum associado encontrado.</TableCell></TableRow>
              ) : filtered.map((a) => (
                <TableRow key={a.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-xs font-bold text-primary">{initials(a.full_name)}</div>
                      <div>
                        <p className="font-medium">{a.full_name}</p>
                        <p className="text-xs text-muted-foreground">{a.cpf ?? "—"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    <p>{a.phone ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{a.email ?? "—"}</p>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{fmtDate(a.join_date)}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                  <TableCell className="text-right font-mono">R$ {Number(a.monthly_fee).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(a); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button size="icon" variant="ghost" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover associado?</AlertDialogTitle>
                            <AlertDialogDescription>Esta ação removerá o associado e todas as mensalidades vinculadas. Não é reversível.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => del.mutate(a.id)}>Remover</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cn: string }> = {
    active: { label: "Ativo", cn: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
    suspended: { label: "Suspenso", cn: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
    inactive: { label: "Inativo", cn: "border-muted bg-muted/30 text-muted-foreground" },
  };
  const v = map[status] ?? map.inactive;
  return <Badge variant="outline" className={v.cn}>{v.label}</Badge>;
}

function AssociateDialog({ editing, onDone }: { editing: Associate | null; onDone: () => void }) {
  const [form, setForm] = useState<any>(editing ?? {
    full_name: "", cpf: "", phone: "", email: "", address: "", city: "Uiraúna", state: "PB",
    birth_date: "", join_date: todayISO(), status: "active", monthly_fee: 50, notes: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, monthly_fee: Number(form.monthly_fee) };
    Object.keys(payload).forEach((k) => { if (payload[k] === "") payload[k] = null; });
    const { error } = editing
      ? await supabase.from("associates").update(payload).eq("id", editing.id)
      : await supabase.from("associates").insert(payload);
    setSaving(false);
    if (error) { toast.error("Erro ao salvar", { description: error.message }); return; }
    toast.success(editing ? "Associado atualizado" : "Associado cadastrado");
    onDone();
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader><DialogTitle>{editing ? "Editar associado" : "Novo associado"}</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2"><Label>Nome completo *</Label><Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
        <div className="space-y-2"><Label>CPF</Label><Input value={form.cpf ?? ""} onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })} /></div>
        <div className="space-y-2"><Label>Telefone</Label><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} /></div>
        <div className="space-y-2"><Label>E-mail</Label><Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="space-y-2"><Label>Nascimento</Label><Input type="date" value={form.birth_date ?? ""} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></div>
        <div className="sm:col-span-2 space-y-2"><Label>Endereço</Label><Input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
        <div className="space-y-2"><Label>Cidade</Label><Input value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
        <div className="space-y-2"><Label>UF</Label><Input maxLength={2} value={form.state ?? ""} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} /></div>
        <div className="space-y-2"><Label>Data de entrada</Label><Input type="date" required value={form.join_date} onChange={(e) => setForm({ ...form, join_date: e.target.value })} /></div>
        <div className="space-y-2"><Label>Mensalidade (R$)</Label><Input type="number" step="0.01" required value={form.monthly_fee} onChange={(e) => setForm({ ...form, monthly_fee: e.target.value })} /></div>
        <div className="space-y-2 sm:col-span-2"><Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="suspended">Suspenso</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 space-y-2"><Label>Observações</Label><Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
        <DialogFooter className="sm:col-span-2">
          <Button type="submit" disabled={saving} className="glow-red">{saving ? "Salvando…" : "Salvar"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
