import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Layers, Bookmark, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { fmtBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/capacitacao/")({
  component: CapacitacaoDashboard,
  head: () => ({ meta: [{ title: "Centro de Capacitação · ABCUNA" }] }),
});

type DashboardStats = {
  categories: number;
  courses: number;
  students: number;
  enrollments: number;
  certificates: number;
};

function CapacitacaoDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["capacitacaoDashboard"],
    queryFn: async () => {
      const [categories, courses, students, enrollments, certificates] = await Promise.all([
        supabase.from("course_categories").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }),
        supabase.from("certificates").select("id", { count: "exact", head: true }),
      ]);

      return {
        categories: categories.count ?? 0,
        courses: courses.count ?? 0,
        students: students.count ?? 0,
        enrollments: enrollments.count ?? 0,
        certificates: certificates.count ?? 0,
      } as DashboardStats;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centro de Capacitação"
        subtitle="Painel de controle e navegação do módulo de capacitação"
        icon={<BookOpen className="h-5 w-5" />}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="glow-red">
              <Link to="/capacitacao/course-categories">Categorias</Link>
            </Button>
            <Button asChild>
              <Link to="/capacitacao/courses">Cursos</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Categorias" value={data?.categories ?? "—"} icon={<Layers className="h-4 w-4" />} accent="text-primary" />
        <StatCard title="Cursos" value={data?.courses ?? "—"} icon={<Bookmark className="h-4 w-4" />} accent="text-emerald-400" />
        <StatCard title="Alunos" value={data?.students ?? "—"} icon={<Users className="h-4 w-4" />} accent="text-sky-400" />
        <StatCard title="Matrículas" value={data?.enrollments ?? "—"} icon={<BookOpen className="h-4 w-4" />} accent="text-violet-400" />
        <StatCard title="Certificados" value={data?.certificates ?? "—"} icon={<Badge className="h-4 w-4" />} accent="text-amber-400" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visão geral</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SectionCard title="Gerenciar categorias" description="Cadastre, edite e organize as categorias de curso." href="/capacitacao/course-categories" />
          <SectionCard title="Gerenciar cursos" description="Controle carga horária, preço e status de cada curso." href="/capacitacao/courses" />
        </CardContent>
      </Card>
    </div>
  );
}

function SectionCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link to={href} className="group block rounded-2xl border border-border/70 bg-card/80 p-5 transition hover:border-primary/60 hover:bg-primary/5">
      <p className="text-sm font-semibold text-muted-foreground">{title}</p>
      <p className="mt-3 text-sm leading-6 text-foreground">{description}</p>
      <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition group-hover:translate-x-0.5">
        Acessar
      </div>
    </Link>
  );
}

function StatCard({ title, value, icon, accent }: { title: string; value: number | string; icon: React.ReactNode; accent: string }) {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-foreground">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border border-current/20 bg-current/10 ${accent}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
