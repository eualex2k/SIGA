import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Receipt, Plus, CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { fmtBRL, fmtDate, fmtMonth, monthStartISO, todayISO } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/fees")({
  component: FeesPage,
  head: () => ({ meta: [{ title: "Mensalidades · ABCUNA" }] }),
});

function FeesPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ["fees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_fees")
        .select("*, associates(id, full_name, monthly_fee)")
        .order("reference_month", { ascending: false })
        .order("due_date", { ascending: false });
      if (error) throw error;
      // Recompute overdue dynamically
      const today = todayISO();
      return (data ?? []).map((f: any) => ({
        ...f,
        status: f.status === "pending" && f.due_date < today ? "overdue" : f.status,
      }));
    },
  });

  const filtered = useMemo(() => fees.filter((f: any) => {
    if (filter !== "all" && f.status !== filter) return false;
    if (search && !(f.associates?.full_name?.toLowerCase() ?? "").includes(search.toLowerCase())) return false;
    return true;
  }), [fees, filter, search]);

  const totalPending = fees.filter((f: any) => f.status !== "paid" && f.status !== "cancelled").reduce((s: number, f: any) => s + Number(f.amount), 0);
  const totalOverdue = fees.filter((f: any) => f.status === "overdue").reduce((s: number, f: any) => s + Number(f.amount), 0);

  const markPaid = useMutation({
    mutationFn: async (fee: any) => {
      const { error } = await supabase.from("monthly_fees").update({ status: "paid", paid_date: todayISO(), payment_method: "PIX" }).eq("id", fee.id);
      if (error) throw error;
      const { data: cat } = await supabase.from("finance_categories").select("id").eq("name", "Mensalidades").maybeSingle();
      await supabase.from("finance_transactions").insert({
        type: "income", amount: fee.amount, description: `Mensalidade - ${fee.associates?.full_name}`,
        category_id: cat?.id, transaction_date: todayISO(), associate_id: fee.associate_id, fee_id: fee.id, payment_method: "PIX",
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fees"] }); toast.success("Pagamento confirmado"); },
    onError: (e: any) => toast.error("Erro", { description: e.message }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mensalidades"
        subtitle={`${fees.length} registros · ${fmtBRL(totalPending)} a receber`}
        icon={<Receipt className="h-5 w-5" />}
        actions={<GenerateFeesDialog />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">A receber</p><p className="mt-1 text-xl font-bold text-amber-400">{fmtBRL(totalPending)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Em atraso</p><p className="mt-1 text-xl font-bold text-primary">{fmtBRL(totalOverdue)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Recebido (geral)</p><p className="mt-1 text-xl font-bold text-emerald-400">{fmtBRL(fees.filter((f: any) => f.status === "paid").reduce((s: number, f: any) => s + Number(f.amount), 0))}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar associado…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="overdue">Em atraso</SelectItem>
              <SelectItem value="paid">Pagas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Associado</TableHead><TableHead>Mês ref.</TableHead><TableHead className="hidden sm:table-cell">Vencimento</TableHead><TableHead className="hidden md:table-cell">Pagamento</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Valor</TableHead><TableHead className="w-24" /></TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (<TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">Carregando…</TableCell></TableRow>)
              : filtered.length === 0 ? (<TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">Nenhuma mensalidade.</TableCell></TableRow>)
              : filtered.map((f: any) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.associates?.full_name ?? "—"}</TableCell>
                  <TableCell className="capitalize">{fmtMonth(f.reference_month)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{fmtDate(f.due_date)}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{f.paid_date ? `${fmtDate(f.paid_date)} (${f.payment_method ?? "—"})` : "—"}</TableCell>
                  <TableCell><FeeStatus s={f.status} /></TableCell>
                  <TableCell className="text-right font-mono">{fmtBRL(f.amount)}</TableCell>
                  <TableCell>
                    {f.status !== "paid" && (
                      <Button size="sm" variant="outline" onClick={() => markPaid.mutate(f)} className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Quitar
                      </Button>
                    )}
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

function FeeStatus({ s }: { s: string }) {
  const map: Record<string, { label: string; cn: string }> = {
    paid: { label: "Pago", cn: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
    pending: { label: "Pendente", cn: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
    overdue: { label: "Em atraso", cn: "border-primary/50 bg-primary/15 text-primary" },
    cancelled: { label: "Cancelada", cn: "border-muted bg-muted/30 text-muted-foreground" },
  };
  const v = map[s] ?? map.pending;
  return <Badge variant="outline" className={v.cn}>{v.label}</Badge>;
}

function GenerateFeesDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(monthStartISO(0));
  const [saving, setSaving] = useState(false);

  const generate = async () => {
    setSaving(true);
    const { data: assoc } = await supabase.from("associates").select("id, monthly_fee").eq("status", "active");
    const refMonth = month.slice(0, 7) + "-01";
    const due = month.slice(0, 7) + "-10";
    const rows = (assoc ?? []).map((a: any) => ({ associate_id: a.id, reference_month: refMonth, amount: a.monthly_fee, due_date: due, status: "pending" as const }));
    const { error } = await supabase.from("monthly_fees").upsert(rows, { onConflict: "associate_id,reference_month", ignoreDuplicates: true });
    setSaving(false);
    if (error) { toast.error("Erro", { description: error.message }); return; }
    toast.success(`Mensalidades geradas para ${rows.length} associado(s)`);
    qc.invalidateQueries({ queryKey: ["fees"] });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="glow-red"><Plus className="mr-2 h-4 w-4" /> Gerar mensalidades</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Gerar mensalidades do mês</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Label>Mês de referência</Label>
          <Input type="month" value={month.slice(0, 7)} onChange={(e) => setMonth(e.target.value + "-01")} />
          <p className="text-xs text-muted-foreground">Será gerada uma cobrança para cada associado ativo, com vencimento dia 10. Duplicidades são ignoradas.</p>
        </div>
        <DialogFooter><Button onClick={generate} disabled={saving} className="glow-red">{saving ? "Gerando…" : "Gerar"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
