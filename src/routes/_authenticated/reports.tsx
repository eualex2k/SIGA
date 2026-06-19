import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileBarChart, Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fmtBRL, fmtDate } from "@/lib/format";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Relatórios · ABCUNA" }] }),
});

function ReportsPage() {
  const { data } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const [txs, cats, fees, payments] = await Promise.all([
        supabase.from("finance_transactions").select("type, amount, transaction_date, category_id, finance_categories(name, color)").gte("transaction_date", new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10)),
        supabase.from("finance_categories").select("*"),
        supabase.from("monthly_fees").select("status, amount, reference_month"),
        supabase.from("staff_payments").select("amount, reference_month, staff(full_name)"),
      ]);
      return { txs: txs.data ?? [], cats: cats.data ?? [], fees: fees.data ?? [], payments: payments.data ?? [] };
    },
  });

  // monthly breakdown
  const monthly = new Map<string, { month: string; entradas: number; saidas: number }>();
  (data?.txs ?? []).forEach((t: any) => {
    const m = (t.transaction_date as string).slice(0, 7);
    const r = monthly.get(m) ?? { month: m, entradas: 0, saidas: 0 };
    if (t.type === "income") r.entradas += Number(t.amount);
    else r.saidas += Number(t.amount);
    monthly.set(m, r);
  });
  const monthlyData = Array.from(monthly.values()).sort((a, b) => a.month.localeCompare(b.month)).map((d) => ({ ...d, label: new Date(d.month + "-02").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }) }));

  // category breakdown for expenses
  const expBy = new Map<string, { name: string; value: number; color: string }>();
  (data?.txs ?? []).filter((t: any) => t.type === "expense").forEach((t: any) => {
    const name = t.finance_categories?.name ?? "Sem categoria";
    const color = t.finance_categories?.color ?? "#dc2626";
    const r = expBy.get(name) ?? { name, value: 0, color };
    r.value += Number(t.amount);
    expBy.set(name, r);
  });
  const expData = Array.from(expBy.values()).sort((a, b) => b.value - a.value);

  const exportCSV = () => {
    const rows = [["Data", "Tipo", "Descrição", "Categoria", "Valor"]];
    (data?.txs ?? []).forEach((t: any) => rows.push([fmtDate(t.transaction_date), t.type === "income" ? "Entrada" : "Saída", "—", t.finance_categories?.name ?? "—", Number(t.amount).toFixed(2)]));
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `abcuna-relatorio-financeiro-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => window.print();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        subtitle="Análise consolidada da operação"
        icon={<FileBarChart className="h-5 w-5" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" /> CSV / Excel</Button>
            <Button variant="outline" onClick={printReport}><Download className="mr-2 h-4 w-4" /> Imprimir / PDF</Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base uppercase tracking-wider text-muted-foreground">Receitas x Despesas (mensal)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                  <XAxis dataKey="label" stroke="oklch(0.68 0.012 60)" fontSize={11} />
                  <YAxis stroke="oklch(0.68 0.012 60)" fontSize={11} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: "oklch(0.17 0.014 25)", border: "1px solid oklch(0.25 0.012 25)", borderRadius: 8 }} formatter={(v: number) => fmtBRL(v)} />
                  <Legend />
                  <Bar dataKey="entradas" fill="oklch(0.68 0.16 150)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="saidas" fill="oklch(0.62 0.24 28)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base uppercase tracking-wider text-muted-foreground">Despesas por categoria</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                    {expData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "oklch(0.17 0.014 25)", border: "1px solid oklch(0.25 0.012 25)", borderRadius: 8 }} formatter={(v: number) => fmtBRL(v)} />
                  <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base uppercase tracking-wider text-muted-foreground">Resumo de mensalidades</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          {["paid", "pending", "overdue", "cancelled"].map((st) => {
            const label = { paid: "Pagas", pending: "Pendentes", overdue: "Em atraso", cancelled: "Canceladas" }[st as keyof typeof st]!;
            const items = (data?.fees ?? []).filter((f: any) => f.status === st);
            const total = items.reduce((s: number, f: any) => s + Number(f.amount), 0);
            return (
              <div key={st} className="rounded-md border border-border/60 bg-card/60 p-4">
                <p className="text-xs uppercase text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-black">{items.length}</p>
                <p className="text-sm font-mono text-muted-foreground">{fmtBRL(total)}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
