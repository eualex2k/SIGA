import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Search, Users, BookOpen, ShieldCheck, CalendarDays, Receipt, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

type SearchItem = {
  id: string;
  url: string;
  label: string;
  description: string;
  section: string;
  icon: React.ReactNode;
};

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const { data = [], isFetching } = useQuery(
    ["global-search", query],
    async () => {
      const term = query.trim();
      if (term.length < 2) return [] as SearchItem[];

      const [associates, courses, staff, finance] = await Promise.all([
        supabase
          .from("associates")
          .select("id, full_name")
          .ilike("full_name", `%${term}%`)
          .limit(5),
        supabase
          .from("courses")
          .select("id, name")
          .ilike("name", `%${term}%`)
          .limit(5),
        supabase
          .from("staff")
          .select("id, full_name, role_title")
          .ilike("full_name", `%${term}%`)
          .limit(5),
        supabase
          .from("finance_transactions")
          .select("id, description, type")
          .ilike("description", `%${term}%`)
          .limit(5),
      ]);

      const items: SearchItem[] = [];

      if (!associates.error && associates.data) {
        items.push(
          ...associates.data.map((associate) => ({
            id: `associate-${associate.id}`,
            url: "/associates",
            label: associate.full_name,
            description: "Associado",
            section: "Associados",
            icon: <Users className="h-4 w-4" />,
          })),
        );
      }

      if (!courses.error && courses.data) {
        items.push(
          ...courses.data.map((course) => ({
            id: `course-${course.id}`,
            url: "/capacitacao/courses",
            label: course.name,
            description: "Curso",
            section: "Cursos",
            icon: <BookOpen className="h-4 w-4" />,
          })),
        );
      }

      if (!staff.error && staff.data) {
        items.push(
          ...staff.data.map((member) => ({
            id: `staff-${member.id}`,
            url: "/staff",
            label: member.full_name,
            description: member.role_title ?? "Funcionário",
            section: "Funcionários",
            icon: <ShieldCheck className="h-4 w-4" />,
          })),
        );
      }

      if (!finance.error && finance.data) {
        items.push(
          ...finance.data.map((transaction) => ({
            id: `finance-${transaction.id}`,
            url: "/finance",
            label: transaction.description ?? "Lançamento financeiro",
            description: transaction.type === "income" ? "Receita" : "Despesa",
            section: "Financeiro",
            icon: <Receipt className="h-4 w-4" />,
          })),
        );
      }

      return items;
    },
    {
      enabled: open,
      staleTime: 1000 * 60 * 5,
      keepPreviousData: true,
    },
  );

  const grouped = useMemo(() => {
    const groups = new Map<string, SearchItem[]>();
    data.forEach((item) => {
      const section = groups.get(item.section) ?? [];
      section.push(item);
      groups.set(item.section, section);
    });
    return Array.from(groups.entries()).map(([section, items]) => ({ section, items }));
  }, [data]);

  const handleSelect = (item: SearchItem) => {
    onOpenChange(false);
    navigate({ to: item.url });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="rounded-xl border border-border/60 bg-background shadow-2xl">
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Search className="h-4 w-4" /> Busca global
            </div>
            <span className="text-xs text-muted-foreground">Pressione Esc para fechar</span>
          </div>
          <div className="mt-3">
            <CommandInput
              placeholder="Pesquisar associados, cursos, colaboradores ou lançamentos..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <CommandList className="px-2 pb-2">
          <CommandEmpty>
            {query.trim().length < 2
              ? "Digite ao menos 2 caracteres para iniciar a busca."
              : isFetching
              ? "Buscando..."
              : "Nenhum resultado encontrado."}
          </CommandEmpty>
          {grouped.map((group, groupIndex) => (
            <div key={group.section}>
              {groupIndex > 0 && <CommandSeparator />}
              <CommandGroup heading={group.section}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item)}
                    className="gap-3"
                  >
                    {item.icon}
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
        <div className="border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
          Resultados de tabelas principais do sistema.
        </div>
      </div>
    </CommandDialog>
  );
}
