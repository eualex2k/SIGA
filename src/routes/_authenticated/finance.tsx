import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet, Plus, TrendingUp, TrendingDown, Trash2, Eye } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { fmtBRL, fmtDate, todayISO } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { MembershipPaymentDialog } from "@/components/MembershipPaymentDialog";

export const Route = createFileRoute("/_authenticated/finance")({
  component: FinancePage,
  head: () => ({ meta: [{ title: "Financeiro · ABCUNA" }] }),
});

function FinancePage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState("90");

  const { data: txs = [], isLoading } = useQuery({
    queryKey: ["finance", period],
    queryFn: async () => {
      const since = new Date(Date.now() - Number(period) * 86400000).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("finance_transactions")
        .select("*, finance_categories(name, color), associates(full_name)")
        .gte("transaction_date", since)
        .order("transaction_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => tab === "all" ? txs : txs.filter((t: any) => t.type === tab), [txs, tab]);
  const totalIn = txs.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalOut = txs.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + Number(t.amount), 0);

  const del = useMutation({
    mutationFn: async (id: string) => {
      // Fetch transaction to get receipt_path before deletion
      const { data: tx, error: fetchErr } = await supabase
        .from("finance_transactions")
        .select("receipt_path")
        .eq("id", id)
        .single();
      if (fetchErr) throw fetchErr;

      // Delete the transaction record
      const { error: delErr } = await supabase.from("finance_transactions").delete().eq("id", id);
      if (delErr) throw delErr;

      // If a receipt file exists, delete it from storage
      if (tx?.receipt_path) {
        const { error: storageErr } = await supabase.storage.from("receipts").remove([tx.receipt_path]);
        if (storageErr) console.error("Failed to delete receipt file:", storageErr);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["finance"] });
      toast.success("Lançamento removido");
    },
    onError: (err: any) => {
      toast.error("Erro ao remover lançamento", { description: err.message });
    },
  });

  const handleViewReceipt = async (receiptPath: string) => {
    const { data, error } = await supabase.storage.from("receipts").createSignedUrl(receiptPath, 60);
    if (error) { toast.error("Erro ao gerar URL do comprovante"); return; }
    window.open(data?.signedUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Controle financeiro"
        subtitle="Receitas, despesas e fluxo de caixa"
        icon={<Wallet className="h-5 w-5" />}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
                <SelectItem value="180">6 meses</SelectItem>
                <SelectItem value="365">1 ano</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="glow-red">
                  <Plus className="mr-2 h-4 w-4" /> Lançamento
                </Button>
              </DialogTrigger>
              <TxDialog onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["finance"] }); }} />
            </Dialog>
            <MembershipPaymentDialog onDone={() => { qc.invalidateQueries({ queryKey: ["finance"] }); }} />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Entradas</p><p className="mt-1 text-xl font-bold text-emerald-400">{fmtBRL(totalIn)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Saídas</p><p className="mt-1 text-xl font-bold text-primary">{fmtBRL(totalOut)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Saldo do período</p><p className={`mt-1 text-xl font-bold ${totalIn - totalOut >= 0 ? "text-emerald-400" : "text-primary"}`}>{fmtBRL(totalIn - totalOut)}</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-card">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="income">Entradas</TabsTrigger>
          <TabsTrigger value="expense">Saídas</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="hidden md:table-cell">Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">Carregando…</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">Sem lançamentos.</TableCell></TableRow>
                  ) : filtered.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm text-muted-foreground">{fmtDate(t.transaction_date)}</TableCell>
                      <TableCell>
                        <p className="font-medium">{t.description}</p>
                        {t.associates && <p className="text-xs text-muted-foreground">{t.associates.full_name}</p>}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {t.finance_categories ? (
                          <Badge variant="outline" style={{ borderColor: t.finance_categories.color + "55", color: t.finance_categories.color }}>{t.finance_categories.name}</Badge>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        {t.type === "income" ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400"><TrendingUp className="h-3 w-3" /> Entrada</span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold text-primary"><TrendingDown className="h-3 w-3" /> Saída</span>
                        )}
                      </TableCell>
                      <TableCell className={`text-right font-mono font-semibold ${t.type === "income" ? "text-emerald-400" : "text-primary"}`}>
                        {t.type === "income" ? "+" : "−"} {fmtBRL(t.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {t.receipt_path && (
                            <Button size="icon" variant="ghost" onClick={() => handleViewReceipt(t.receipt_path)} title="Ver comprovante">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" onClick={() => del.mutate(t.id)} className="text-destructive hover:text-destructive" title="Excluir">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Novo Lançamento (com upload de comprovante) ─── */
function TxDialog({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISO());
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [method, setMethod] = useState("PIX");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: cats = [] } = useQuery({
    queryKey: ["cats"],
    queryFn: async () => (await supabase.from("finance_categories").select("*").order("name")).data ?? [],
  });

  const cats4Type = cats.filter((c: any) => c.type === type);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Upload receipt if provided
    let receiptPath: string | null = null;
    if (receiptFile) {
      const filePath = `${user?.id ?? "anon"}/${Date.now()}_${receiptFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, receiptFile);
      if (uploadError) {
        toast.error("Erro ao enviar comprovante");
        setSaving(false);
        return;
      }
      receiptPath = uploadData?.path ?? null;
    }

    const { error } = await supabase.from("finance_transactions").insert({
      type,
      amount: Number(amount),
      description,
      transaction_date: date,
      category_id: categoryId,
      payment_method: method,
      reference: notes || null,
      receipt_path: receiptPath,
    });
    setSaving(false);
    if (error) { toast.error("Erro", { description: error.message }); return; }
    toast.success("Lançamento registrado");
    onDone();
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>Novo lançamento</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2"><Label>Tipo</Label>
          <Select value={type} onValueChange={(v: any) => { setType(v); setCategoryId(undefined); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Entrada (receita)</SelectItem>
              <SelectItem value="expense">Saída (despesa)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Valor *</Label><Input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
        <div className="space-y-2"><Label>Data</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="sm:col-span-2 space-y-2"><Label>Descrição *</Label><Input required value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="space-y-2"><Label>Categoria</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
            <SelectContent>{cats4Type.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Forma de pagto</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PIX">PIX</SelectItem><SelectItem value="Dinheiro">Dinheiro</SelectItem><SelectItem value="Cartão">Cartão</SelectItem><SelectItem value="Transferência">Transferência</SelectItem><SelectItem value="Boleto">Boleto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label>Comprovante (JPEG, PNG, PDF)</Label>
          <Input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setReceiptFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="sm:col-span-2 space-y-2"><Label>Observação</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        <DialogFooter className="sm:col-span-2"><Button type="submit" disabled={saving} className="glow-red">{saving ? "Salvando…" : "Registrar"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}
