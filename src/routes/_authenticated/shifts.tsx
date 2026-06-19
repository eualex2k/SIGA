import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
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
import { fmtDate, todayISO } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/shifts")({
  component: ShiftsPage,
  head: () => ({ meta: [{ title: "Escalas · ABCUNA" }] }),
});

function ShiftsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("upcoming");

  const { data: shifts = [] } = useQuery({
    queryKey: ["shifts", filter],
    queryFn: async () => {
      let q = supabase.from("shifts").select("*, staff(full_name, role_title)").order("shift_date").order("start_time");
      const today = todayISO();
      if (filter === "upcoming") q = q.gte("shift_date", today);
      if (filter === "past") q = q.lt("shift_date", today);
      const { data } = await q;
      return data ?? [];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("shifts").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shifts"] }); toast.success("Escala removida"); },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Escalas de serviço"
        subtitle={`${shifts.length} plantões`}
        icon={<CalendarDays className="h-5 w-5" />}
        actions={
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Próximas</SelectItem>
                <SelectItem value="past">Passadas</SelectItem>
                <SelectItem value="all">Todas</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button className="glow-red"><Plus className="mr-2 h-4 w-4" /> Nova escala</Button></DialogTrigger>
              <ShiftDialog onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["shifts"] }); }} />
            </Dialog>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Colaborador</TableHead><TableHead className="hidden md:table-cell">Horário</TableHead><TableHead className="hidden lg:table-cell">Local</TableHead><TableHead>Status</TableHead><TableHead className="w-12" /></TableRow></TableHeader>
            <TableBody>
              {shifts.length === 0 ? (<TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">Nenhuma escala.</TableCell></TableRow>)
              : shifts.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono">{fmtDate(s.shift_date)}</TableCell>
                  <TableCell><p className="font-medium">{s.staff?.full_name}</p><p className="text-xs text-muted-foreground">{s.staff?.role_title}</p></TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-sm">{(s.start_time as string).slice(0, 5)} – {(s.end_time as string).slice(0, 5)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{s.location ?? "—"}</TableCell>
                  <TableCell><ShiftStatus s={s.status} /></TableCell>
                  <TableCell><Button size="icon" variant="ghost" onClick={() => del.mutate(s.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ShiftStatus({ s }: { s: string }) {
  const map: Record<string, { label: string; cn: string }> = {
    scheduled: { label: "Agendado", cn: "border-sky-500/40 bg-sky-500/10 text-sky-400" },
    completed: { label: "Concluído", cn: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
    missed: { label: "Faltou", cn: "border-primary/50 bg-primary/15 text-primary" },
    cancelled: { label: "Cancelado", cn: "border-muted text-muted-foreground" },
  };
  const v = map[s] ?? map.scheduled;
  return <Badge variant="outline" className={v.cn}>{v.label}</Badge>;
}

function ShiftDialog({ onDone }: { onDone: () => void }) {
  const { data: staff = [] } = useQuery({ queryKey: ["staff-active"], queryFn: async () => (await supabase.from("staff").select("id, full_name").eq("active", true).order("full_name")).data ?? [] });
  const [form, setForm] = useState({ staff_id: "", shift_date: todayISO(), start_time: "07:00", end_time: "19:00", location: "Quartel Central", status: "scheduled" });
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staff_id) { toast.error("Selecione o colaborador"); return; }
    setSaving(true);
    const [sh, sm] = form.start_time.split(":").map(Number);
    const [eh, em] = form.end_time.split(":").map(Number);
    let hours = (eh + em / 60) - (sh + sm / 60);
    if (hours < 0) hours += 24;
    const { error } = await supabase.from("shifts").insert({ ...form, hours });
    setSaving(false);
    if (error) { toast.error("Erro", { description: error.message }); return; }
    toast.success("Escala criada");
    onDone();
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Nova escala</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2"><Label>Colaborador *</Label>
          <Select value={form.staff_id} onValueChange={(v) => setForm({ ...form, staff_id: v })}>
            <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
            <SelectContent>{staff.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Data</Label><Input type="date" required value={form.shift_date} onChange={(e) => setForm({ ...form, shift_date: e.target.value })} /></div>
        <div className="space-y-2"><Label>Local</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
        <div className="space-y-2"><Label>Início</Label><Input type="time" required value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
        <div className="space-y-2"><Label>Fim</Label><Input type="time" required value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
        <DialogFooter className="sm:col-span-2"><Button type="submit" disabled={saving} className="glow-red">{saving ? "Salvando…" : "Agendar"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}
