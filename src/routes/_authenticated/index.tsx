import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Wallet,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  CalendarDays,
  Activity,
  Siren,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { supabase } from "@/integrations/supabase/client";
import { fmtBRL, fmtDate } from "@/lib/format";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export const Route = createFileRoute("/_authenticated/")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Central · ABCUNA" }] }),
});

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [txs, associates, pendingFees, lowStock, todayShifts, lastTxs] = await Promise.all([
        supabase.from("finance_transactions").select("type, amount, transaction_date").gte("transaction_date", new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10)),
        supabase.from("associates").select("id, status", { count: "exact" }),
        supabase.from("monthly_fees").select("id, status, amount, due_date, associates(full_name)").in("status", ["pending", "overdue"]),
        supabase.from("inventory_items").select("id, name, quantity, min_quantity").order("quantity"),
        supabase.from("shifts").select("id, shift_date, start_time, end_time, location, staff(full_name)").eq("shift_date", new Date().toISOString().slice(0, 10)),
        supabase.from("finance_transactions").select("id, type, amount, description, transaction_date").order("created_at", { ascending: false }).limit(8),
      ]);
      return { txs: txs.data ?? [], associates: associates.data ?? [], pendingFees: pendingFees.data ?? [], lowStock: (lowStock.data ?? []).filter((i) => i.quantity <= i.min_quantity), todayShifts: todayShifts.data ?? [], lastTxs: lastTxs.data ?? [] };
    },
  });

  const totalIn = data?.txs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0) ?? 0;
  const totalOut = data?.txs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0) ?? 0;
  const balance = totalIn - totalOut;
  const activeAssociates = data?.associates.filter((a) => a.status === "active").length ?? 0;
  const overdueCount = data?.pendingFees.filter((f) => f.status === "overdue").length ?? 0;

  // Build monthly chart data from txs
  const chartMap = new Map<string, { month: string; entradas: number; saidas: number }>();
  (data?.txs ?? []).forEach((t) => {
    const m = (t.transaction_date as string).slice(0, 7);
    const e = chartMap.get(m) ?? { month: m, entradas: 0, saidas: 0 };
    if (t.type === "income") e.entradas += Number(t.amount);
    else e.saidas += Number(t.amount);
    chartMap.set(m, e);
  });
  const chartData = Array.from(chartMap.values()).sort((a, b) => a.month.localeCompare(b.month)).map((d) => ({ ...d, label: new Date(d.month + "-02").toLocaleDateString("pt-BR", { month: "short" }) }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Central Operacional"
        subtitle={`${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
        icon={<Activity className="h-5 w-5" />}
        actions={<Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary"><Siren className="mr-1 h-3 w-3" /> SISTEMA ATIVO</Badge>}
      />

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Saldo em caixa" value={fmtBRL(balance)} icon={<Wallet className="h-4 w-4" />} accent="text-primary" sub={`${data?.txs.length ?? 0} lançamentos`} loading={isLoading} />
        <KpiCard label="Entradas (período)" value={fmtBRL(totalIn)} icon={<TrendingUp className="h-4 w-4" />} accent="text-emerald-400" sub="Últimos 180 dias" loading={isLoading} />
        <KpiCard label="Saídas (período)" value={fmtBRL(totalOut)} icon={<TrendingDown className="h-4 w-4" />} accent="text-orange-400" sub="Últimos 180 dias" loading={isLoading} />
        <KpiCard label="Associados ativos" value={String(activeAssociates)} icon={<Users className="h-4 w-4" />} accent="text-sky-400" sub={`${data?.associates.length ?? 0} total`} loading={isLoading} />
      </div>

      {/* Alerts */}
      {(overdueCount > 0 || (data?.lowStock.length ?? 0) > 0) && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-primary" /> Alertas operacionais
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            {overdueCount > 0 && (
              <Link to="/fees" className="flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 hover:bg-destructive/20">
                <span><strong>{overdueCount}</strong> mensalidade(s) em atraso</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
            {(data?.lowStock.length ?? 0) > 0 && (
              <Link to="/inventory" className="flex items-center justify-between rounded-md border border-warning/40 bg-warning/10 px-3 py-2 hover:bg-warning/20">
                <span><strong>{data?.lowStock.length}</strong> item(ns) com estoque baixo</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold uppercase tracking-wider text-muted-foreground">Fluxo financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="cIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.68 0.16 150)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="oklch(0.68 0.16 150)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.24 28)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="oklch(0.62 0.24 28)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                  <XAxis dataKey="label" stroke="oklch(0.68 0.012 60)" fontSize={11} />
                  <YAxis stroke="oklch(0.68 0.012 60)" fontSize={11} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "oklch(0.17 0.014 25)", border: "1px solid oklch(0.25 0.012 25)", borderRadius: 8 }}
                    formatter={(v: number) => fmtBRL(v)}
                  />
                  <Area type="monotone" dataKey="entradas" stroke="oklch(0.68 0.16 150)" fill="url(#cIn)" strokeWidth={2} />
                  <Area type="monotone" dataKey="saidas" stroke="oklch(0.62 0.24 28)" fill="url(#cOut)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Today shifts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold uppercase tracking-wider text-muted-foreground">
              <CalendarDays className="h-4 w-4" /> Escalas de hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.todayShifts ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma escala para hoje.</p>
            ) : (
              data?.todayShifts.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between rounded-md border border-border/60 bg-card/60 p-2 text-sm">
                  <div>
                    <p className="font-medium">{s.staff?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{s.location ?? "—"}</p>
                  </div>
                  <Badge variant="outline" className="font-mono">{(s.start_time as string).slice(0, 5)}–{(s.end_time as string).slice(0, 5)}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Last transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold uppercase tracking-wider text-muted-foreground">Últimos lançamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.lastTxs ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Sem registros.</p>
            ) : (
              data?.lastTxs.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between border-b border-border/40 py-2 text-sm last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-md ${t.type === "income" ? "bg-emerald-500/15 text-emerald-400" : "bg-primary/15 text-primary"}`}>
                      {t.type === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="line-clamp-1 font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{fmtDate(t.transaction_date)}</p>
                    </div>
                  </div>
                  <span className={`font-mono font-semibold ${t.type === "income" ? "text-emerald-400" : "text-primary"}`}>{t.type === "income" ? "+" : "−"} {fmtBRL(t.amount)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Low stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold uppercase tracking-wider text-muted-foreground">
              <Package className="h-4 w-4" /> Estoque crítico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.lowStock ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Todos os itens com estoque saudável.</p>
            ) : (
              data?.lowStock.map((i: any) => (
                <div key={i.id} className="flex items-center justify-between rounded-md border border-warning/30 bg-warning/5 p-2 text-sm">
                  <div>
                    <p className="font-medium">{i.name}</p>
                    <p className="text-xs text-muted-foreground">Mín.: {i.min_quantity}</p>
                  </div>
                  <Badge variant="destructive" className="font-mono">{i.quantity}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, accent, sub, loading }: { label: string; value: string; icon: React.ReactNode; accent: string; sub?: string; loading?: boolean }) {
  return (
    <Card className="relative overflow-hidden border-border/60 bg-card/70 backdrop-blur transition-colors hover:border-primary/40">
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent`} />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
          <span className={`flex h-7 w-7 items-center justify-center rounded-md border border-current/20 bg-current/10 ${accent}`}>{icon}</span>
        </div>
        <p className={`mt-3 text-2xl font-black tabular-nums ${accent}`}>{loading ? "…" : value}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
