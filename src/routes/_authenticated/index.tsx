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
  BookOpen,
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
      const [
        txs,
        associates,
        pendingFees,
        lowStock,
        todayShifts,
        lastTxs,
        coursesCount,
      ] = await Promise.all([
        supabase
          .from("finance_transactions")
          .select("type, amount, transaction_date")
          .gte("transaction_date", new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10)),
        supabase.from("associates").select("id, status", { count: "exact" }),
        supabase
          .from("monthly_fees")
          .select("id, status, amount, due_date, associates(full_name)")
          .in("status", ["pending", "overdue"]),
        supabase.from("inventory_items").select("id, name, quantity, min_quantity").order("quantity"),
        supabase
          .from("shifts")
          .select("id, shift_date, start_time, end_time, location, staff(full_name)")
          .eq("shift_date", new Date().toISOString().slice(0, 10)),
        supabase
          .from("finance_transactions")
          .select("id, type, amount, description, transaction_date")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase.from("courses").select("id"),
      ]);

      return {
        txs: txs.data ?? [],
        associates: associates.data ?? [],
        pendingFees: pendingFees.data ?? [],
        lowStock: (lowStock.data ?? []).filter((item) => item.quantity <= item.min_quantity),
        todayShifts: todayShifts.data ?? [],
        lastTxs: lastTxs.data ?? [],
        coursesCount: coursesCount.data?.length ?? 0,
      };
    },
  });

  const totalIn = data?.txs.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
  const totalOut = data?.txs.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
  const balance = totalIn - totalOut;
  const activeAssociates = data?.associates.filter((associate) => associate.status === "active").length ?? 0;
  const overdueCount = data?.pendingFees.filter((fee) => fee.status === "overdue").length ?? 0;
  const lowStockCount = data?.lowStock.length ?? 0;

  const chartMap = new Map<string, { month: string; entradas: number; saidas: number }>();
  (data?.txs ?? []).forEach((transaction) => {
    const month = (transaction.transaction_date as string).slice(0, 7);
    const summary = chartMap.get(month) ?? { month, entradas: 0, saidas: 0 };
    if (transaction.type === "income") summary.entradas += Number(transaction.amount);
    else summary.saidas += Number(transaction.amount);
    chartMap.set(month, summary);
  });

  const chartData = Array.from(chartMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((summary) => ({
      ...summary,
      label: new Date(`${summary.month}-02`).toLocaleDateString("pt-BR", { month: "short" }),
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Central Operacional"
        subtitle={`Veja os principais indicadores do sistema e acompanhe as pendências do dia.`}
        icon={<Activity className="h-5 w-5" />}
        actions={
          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
            <Siren className="mr-1 h-3 w-3" /> SISTEMA ATIVO
          </Badge>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          label="Saldo em caixa"
          value={fmtBRL(balance)}
          icon={<Wallet className="h-4 w-4" />}
          accent="text-primary"
          sub={`${data?.txs.length ?? 0} lançamentos`}
          loading={isLoading}
        />
        <DashboardCard
          label="Receitas"
          value={fmtBRL(totalIn)}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="text-success"
          sub="Últimos 180 dias"
          loading={isLoading}
        />
        <DashboardCard
          label="Despesas"
          value={fmtBRL(totalOut)}
          icon={<TrendingDown className="h-4 w-4" />}
          accent="text-destructive"
          sub="Últimos 180 dias"
          loading={isLoading}
        />
        <DashboardCard
          label="Associados ativos"
          value={String(activeAssociates)}
          icon={<Users className="h-4 w-4" />}
          accent="text-secondary"
          sub={`${data?.associates.length ?? 0} total`}
          loading={isLoading}
        />
      </div>

      {(overdueCount > 0 || lowStockCount > 0) && (
        <Card className="rounded-3xl border border-primary/25 bg-primary/5 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-primary">Alertas operacionais</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {overdueCount > 0 && (
              <Link
                to="/fees"
                className="flex items-center justify-between rounded-3xl border border-destructive/40 bg-destructive/10 px-4 py-4 text-sm text-destructive transition hover:bg-destructive/15"
              >
                <span>{overdueCount} mensalidade(s) em atraso</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
            {lowStockCount > 0 && (
              <Link
                to="/inventory"
                className="flex items-center justify-between rounded-3xl border border-warning/40 bg-warning/10 px-4 py-4 text-sm text-warning transition hover:bg-warning/15"
              >
                <span>{lowStockCount} item(ns) com estoque baixo</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold uppercase tracking-[0.16em] text-muted-foreground">Fluxo financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="cIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3aad85" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3aad85" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#883935" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#883935" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(236,229,210,0.14)" />
                  <XAxis dataKey="label" stroke="#c1ccd9" fontSize={12} />
                  <YAxis stroke="#c1ccd9" fontSize={12} tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", borderRadius: 14, border: "1px solid rgba(236,229,210,0.14)" }}
                    formatter={(value: number) => fmtBRL(value)}
                  />
                  <Area type="monotone" dataKey="entradas" stroke="#3aad85" fill="url(#cIn)" strokeWidth={2} />
                  <Area type="monotone" dataKey="saidas" stroke="#883935" fill="url(#cOut)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold uppercase tracking-[0.16em] text-muted-foreground">Escalas hoje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.todayShifts ?? []).length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma escala para hoje.</p>
              ) : (
                data.todayShifts.map((shift: any) => (
                  <div key={shift.id} className="rounded-3xl border border-border/60 bg-background/80 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{shift.staff?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{shift.location ?? "—"}</p>
                      </div>
                      <span className="rounded-full bg-card text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground px-3 py-1">
                        {(shift.start_time as string).slice(0, 5)}–{(shift.end_time as string).slice(0, 5)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold uppercase tracking-[0.16em] text-muted-foreground">Estoque crítico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStockCount === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Todos os itens com estoque saudável.</p>
              ) : (
                data?.lowStock.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between rounded-3xl border border-warning/30 bg-warning/10 p-4 shadow-sm">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Mín.: {item.min_quantity}</p>
                    </div>
                    <span className="rounded-full bg-warning/20 px-3 py-1 text-sm font-semibold text-warning">{item.quantity}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold uppercase tracking-[0.16em] text-muted-foreground">Últimos lançamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.lastTxs ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Sem registros.</p>
            ) : (
              data.lastTxs.map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between rounded-3xl border border-border/60 bg-background/80 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${transaction.type === "income" ? "bg-emerald-500/15 text-emerald-400" : "bg-primary/15 text-primary"}`}>
                      {transaction.type === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground line-clamp-1">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{fmtDate(transaction.transaction_date)}</p>
                    </div>
                  </div>
                  <span className={`font-mono font-semibold ${transaction.type === "income" ? "text-emerald-400" : "text-primary"}`}>
                    {transaction.type === "income" ? "+" : "−"} {fmtBRL(transaction.amount)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold uppercase tracking-[0.16em] text-muted-foreground">Resumo rápido</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-3xl border border-border/60 bg-background/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Cursos cadastrados</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{data?.coursesCount ?? 0}</p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-background/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Escalas hoje</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{data?.todayShifts.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardCard({ label, value, icon, accent, sub, loading }: { label: string; value: string; icon: React.ReactNode; accent: string; sub?: string; loading?: boolean }) {
  return (
    <Card className="relative overflow-hidden border border-border/60 bg-card/80 shadow-sm transition hover:border-primary/40 hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">{label}</span>
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-current/15 bg-current/10 ${accent}`}>{icon}</div>
        </div>
        <p className={`mt-5 text-3xl font-black leading-none ${accent}`}>{loading ? "—" : value}</p>
        {sub && <p className="mt-2 text-sm text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
