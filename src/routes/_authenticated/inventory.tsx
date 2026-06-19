import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, Plus, ArrowDown, ArrowUp, AlertTriangle, Trash2 } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/inventory")({
  component: InventoryPage,
  head: () => ({ meta: [{ title: "Estoque · ABCUNA" }] }),
});

function InventoryPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [movItem, setMovItem] = useState<any | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => (await supabase.from("inventory_items").select("*").order("name")).data ?? [],
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("inventory_items").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inventory"] }); toast.success("Item removido"); },
  });

  const lowCount = items.filter((i: any) => i.quantity <= i.min_quantity).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque operacional"
        subtitle={`${items.length} itens cadastrados · ${lowCount} crítico(s)`}
        icon={<Boxes className="h-5 w-5" />}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="glow-red"><Plus className="mr-2 h-4 w-4" /> Novo item</Button></DialogTrigger>
            <ItemDialog onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["inventory"] }); }} />
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="hidden md:table-cell">Categoria</TableHead><TableHead className="hidden lg:table-cell">Local</TableHead><TableHead className="text-right">Qtd.</TableHead><TableHead className="text-right">Mín.</TableHead><TableHead>Status</TableHead><TableHead className="w-48" /></TableRow></TableHeader>
            <TableBody>
              {isLoading ? (<TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">Carregando…</TableCell></TableRow>)
              : items.length === 0 ? (<TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">Nenhum item.</TableCell></TableRow>)
              : items.map((i: any) => {
                const low = i.quantity <= i.min_quantity;
                return (
                  <TableRow key={i.id}>
                    <TableCell><p className="font-medium">{i.name}</p><p className="text-xs text-muted-foreground">{i.unit}</p></TableCell>
                    <TableCell className="hidden md:table-cell">{i.category ?? "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{i.location ?? "—"}</TableCell>
                    <TableCell className={`text-right font-mono text-lg font-bold ${low ? "text-primary" : "text-foreground"}`}>{i.quantity}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{i.min_quantity}</TableCell>
                    <TableCell>{low ? <Badge variant="outline" className="border-primary/50 bg-primary/15 text-primary"><AlertTriangle className="mr-1 h-3 w-3" /> Crítico</Badge> : <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400">OK</Badge>}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => setMovItem(i)}>Movimentar</Button>
                        <Button size="icon" variant="ghost" onClick={() => del.mutate(i.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!movItem} onOpenChange={(o) => !o && setMovItem(null)}>
        {movItem && <MovementDialog item={movItem} onDone={() => { setMovItem(null); qc.invalidateQueries({ queryKey: ["inventory"] }); }} />}
      </Dialog>
    </div>
  );
}

function ItemDialog({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ name: "", category: "Equipamento", unit: "un", quantity: 0, min_quantity: 5, unit_cost: 0, location: "" });
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const qty = Number(form.quantity);
    const { data: created, error } = await supabase.from("inventory_items").insert({ ...form, quantity: 0, min_quantity: Number(form.min_quantity), unit_cost: Number(form.unit_cost) || null }).select("id").single();
    if (!error && created && qty > 0) {
      await supabase.from("inventory_movements").insert({ item_id: created.id, type: "in", quantity: qty, reason: "Estoque inicial" });
    }
    setSaving(false);
    if (error) { toast.error("Erro", { description: error.message }); return; }
    toast.success("Item cadastrado");
    onDone();
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Novo item de estoque</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2"><Label>Nome *</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-2"><Label>Categoria</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Equipamento">Equipamento</SelectItem><SelectItem value="Uniforme">Uniforme</SelectItem><SelectItem value="Material">Material</SelectItem><SelectItem value="Veículo">Veículo</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Unidade</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
        <div className="space-y-2"><Label>Quantidade inicial</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
        <div className="space-y-2"><Label>Mínimo p/ alerta</Label><Input type="number" value={form.min_quantity} onChange={(e) => setForm({ ...form, min_quantity: Number(e.target.value) })} /></div>
        <div className="space-y-2"><Label>Custo unitário</Label><Input type="number" step="0.01" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: Number(e.target.value) })} /></div>
        <div className="space-y-2"><Label>Local</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
        <DialogFooter className="sm:col-span-2"><Button type="submit" disabled={saving} className="glow-red">{saving ? "Salvando…" : "Cadastrar"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}

function MovementDialog({ item, onDone }: { item: any; onDone: () => void }) {
  const [type, setType] = useState<"in" | "out">("in");
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("inventory_movements").insert({ item_id: item.id, type, quantity: Number(qty), reason });
    setSaving(false);
    if (error) { toast.error("Erro", { description: error.message }); return; }
    toast.success(`${type === "in" ? "Entrada" : "Saída"} registrada`);
    onDone();
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Movimentar: {item.name}</DialogTitle></DialogHeader>
      <p className="text-sm text-muted-foreground">Saldo atual: <span className="font-mono font-bold text-foreground">{item.quantity}</span> {item.unit}</p>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant={type === "in" ? "default" : "outline"} onClick={() => setType("in")} className={type === "in" ? "bg-emerald-600 hover:bg-emerald-700" : ""}><ArrowDown className="mr-2 h-4 w-4" /> Entrada</Button>
          <Button type="button" variant={type === "out" ? "default" : "outline"} onClick={() => setType("out")} className={type === "out" ? "bg-primary glow-red" : ""}><ArrowUp className="mr-2 h-4 w-4" /> Saída</Button>
        </div>
        <div className="space-y-2"><Label>Quantidade</Label><Input type="number" min={1} required value={qty} onChange={(e) => setQty(Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Motivo</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex.: uso em atendimento, compra, doação…" /></div>
        <DialogFooter><Button type="submit" disabled={saving} className="glow-red">{saving ? "Salvando…" : "Confirmar"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}
