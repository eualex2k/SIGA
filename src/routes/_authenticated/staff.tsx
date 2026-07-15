import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Plus, Trash2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { fmtBRL, fmtDate, maskCPF, maskPhone, monthStartISO, initials } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/staff")({
  component: StaffPage,
  head: () => ({ meta: [{ title: "Colaboradores · ABCUNA" }] }),
});

function StaffPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [payOpen, setPayOpen] = useState<any | null>(null);

  const { data: staff = [] } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => (await supabase.from("staff").select("*").order("full_name")).data ?? [],
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["staff-payments"],
    queryFn: async () =>
      (
        await supabase
          .from("staff_payments")
          .select("*")
          .order("reference_month", { ascending: false })
      ).data ?? [],
  });

  const summary = staff.map((s: any) => {
    const total = payments
      .filter((p: any) => p.staff_id === s.id)
      .reduce((a: number, p: any) => a + Number(p.amount), 0);
    return { ...s, totalPaid: total };
  });
  const maxPaid = Math.max(...summary.map((s: any) => s.totalPaid), 1);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("staff").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Colaborador removido");
    },
    onError: (e: any) => toast.error("Falha ao remover colaborador", { description: e.message }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Colaboradores"
        subtitle={`${staff.length} cadastrados · ${staff.filter((s: any) => s.active).length} ativos`}
        icon={<ShieldCheck className="h-5 w-5" />}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="glow-red">
                <Plus className="mr-2 h-4 w-4" /> Novo colaborador
              </Button>
            </DialogTrigger>
            <StaffDialog
              onDone={() => {
                setOpen(false);
                qc.invalidateQueries({ queryKey: ["staff"] });
              }}
            />
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead className="hidden md:table-cell">Cargo</TableHead>
                <TableHead className="hidden lg:table-cell">Admissão</TableHead>
                <TableHead className="text-right">R$/hora</TableHead>
                <TableHead className="hidden md:table-cell">Total recebido</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-44" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    Nenhum colaborador.
                  </TableCell>
                </TableRow>
              ) : (
                summary.map((s: any) => {
                  const pct = (s.totalPaid / maxPaid) * 100;
                  const isLowest =
                    s.totalPaid ===
                    Math.min(...summary.filter((x: any) => x.active).map((x: any) => x.totalPaid));
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-xs font-bold text-primary">
                            {initials(s.full_name)}
                          </div>
                          <div>
                            <p className="font-medium">{s.full_name}</p>
                            <p className="text-xs text-muted-foreground">{s.email ?? "—"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{s.role_title ?? "—"}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {fmtDate(s.hire_date)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {fmtBRL(s.hourly_rate)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs">{fmtBRL(s.totalPaid)}</span>
                          {isLowest && s.active && (
                            <Badge
                              variant="outline"
                              className="border-amber-500/40 bg-amber-500/10 text-amber-400 text-[10px]"
                            >
                              Menor
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {s.active ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          >
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-muted text-muted-foreground">
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" onClick={() => setPayOpen(s)}>
                            <DollarSign className="mr-1 h-3 w-3" /> Pagar
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => del.mutate(s.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!payOpen} onOpenChange={(o) => !o && setPayOpen(null)}>
        {payOpen && (
          <PayDialog
            staff={payOpen}
            onDone={() => {
              setPayOpen(null);
              qc.invalidateQueries({ queryKey: ["staff-payments"] });
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

function StaffDialog({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState<any>({
    full_name: "",
    cpf: "",
    phone: "",
    email: "",
    role_title: "Bombeiro Civil",
    hourly_rate: 20,
    hire_date: new Date().toISOString().slice(0, 10),
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, hourly_rate: Number(form.hourly_rate) };
    Object.keys(payload).forEach((k) => {
      if (payload[k] === "") payload[k] = null;
    });
    const { error } = await supabase.from("staff").insert(payload);
    setSaving(false);
    if (error) {
      toast.error("Erro", { description: error.message });
      return;
    }
    toast.success("Colaborador cadastrado");
    onDone();
  };
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Novo colaborador</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <Label>Nome completo *</Label>
          <Input
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>CPF</Label>
          <Input
            value={form.cpf ?? ""}
            onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input
            value={form.phone ?? ""}
            onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>E-mail</Label>
          <Input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Cargo</Label>
          <Input
            value={form.role_title ?? ""}
            onChange={(e) => setForm({ ...form, role_title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>R$/hora</Label>
          <Input
            type="number"
            step="0.01"
            value={form.hourly_rate}
            onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Admissão</Label>
          <Input
            type="date"
            value={form.hire_date}
            onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
          <Label className="cursor-pointer">Ativo</Label>
        </div>
        <DialogFooter className="sm:col-span-2">
          <Button type="submit" disabled={saving} className="glow-red">
            {saving ? "Salvando…" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function PayDialog({ staff, onDone }: { staff: any; onDone: () => void }) {
  const [month, setMonth] = useState(monthStartISO(0).slice(0, 7));
  const [hours, setHours] = useState(0);
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const finalAmount = Number(amount) || Number(hours) * Number(staff.hourly_rate);
    const { error } = await supabase.from("staff_payments").insert({
      staff_id: staff.id,
      reference_month: `${month}-01`,
      amount: finalAmount,
      paid_date: new Date().toISOString().slice(0, 10),
      hours_worked: Number(hours) || null,
      notes,
    });
    if (!error) {
      const { data: cat } = await supabase
        .from("finance_categories")
        .select("id")
        .eq("name", "Pagamento de Pessoal")
        .maybeSingle();
      await supabase.from("finance_transactions").insert({
        type: "expense",
        amount: finalAmount,
        description: `Pagamento - ${staff.full_name}`,
        category_id: cat?.id,
        transaction_date: new Date().toISOString().slice(0, 10),
        payment_method: "PIX",
      });
    }
    setSaving(false);
    if (error) {
      toast.error("Erro", { description: error.message });
      return;
    }
    toast.success("Pagamento registrado");
    onDone();
  };
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Pagar: {staff.full_name}</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Mês de referência</Label>
          <Input type="month" required value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Horas trabalhadas</Label>
          <Input
            type="number"
            step="0.5"
            value={hours}
            onChange={(e) => {
              setHours(Number(e.target.value));
              setAmount(Number(e.target.value) * Number(staff.hourly_rate));
            }}
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label>Valor (R$)</Label>
          <Input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label>Observação</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <DialogFooter className="sm:col-span-2">
          <Button type="submit" disabled={saving} className="glow-red">
            {saving ? "Salvando…" : "Confirmar pagamento"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
