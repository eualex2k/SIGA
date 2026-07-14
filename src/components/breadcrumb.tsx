import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

const LABELS: Record<string, string> = {
  "": "Central",
  associates: "Associados",
  fees: "Mensalidades",
  finance: "Financeiro",
  inventory: "Estoque",
  staff: "Funcionários",
  shifts: "Escalas",
  reports: "Relatórios",
  capacitacao: "Centro de Capacitação",
  courses: "Cursos",
  "course-categories": "Categorias",
  profile: "Perfil",
};

function formatSegment(segment: string) {
  return LABELS[segment] ?? segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function Breadcrumb() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = [{ label: "Central", href: "/" }];

  segments.forEach((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    crumbs.push({ label: formatSegment(segment), href });
  });

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
        {crumbs.map((crumb, index) => (
          <li key={`${crumb.href}-${index}`} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            {index === crumbs.length - 1 ? (
              <span className="truncate font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link to={crumb.href} className="truncate text-muted-foreground transition-colors hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
