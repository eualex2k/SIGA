import { useMemo, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Receipt,
  Wallet,
  Boxes,
  CalendarDays,
  ShieldCheck,
  FileBarChart,
  BookOpen,
  Settings,
  LogOut,
  Siren,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { AbcunaBrand } from "@/components/abcuna-brand";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { initials } from "@/lib/format";

const sections: { label: string; key: string; items: { title: string; url: string; icon: any }[] }[] = [
  {
    label: "Dashboard",
    key: "dashboard",
    items: [{ title: "Central", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "Operacional",
    key: "operacional",
    items: [
      { title: "Associados", url: "/associates", icon: Users },
      { title: "Funcionários", url: "/staff", icon: ShieldCheck },
      { title: "Escalas", url: "/shifts", icon: CalendarDays },
    ],
  },
  {
    label: "Financeiro",
    key: "financeiro",
    items: [
      { title: "Financeiro", url: "/finance", icon: Wallet },
      { title: "Mensalidades", url: "/fees", icon: Receipt },
      { title: "Relatórios", url: "/reports", icon: FileBarChart },
    ],
  },
  {
    label: "Recursos",
    key: "recursos",
    items: [
      { title: "Capacitação", url: "/capacitacao", icon: BookOpen },
      { title: "Estoque", url: "/inventory", icon: Boxes },
    ],
  },
];

const footerItems = [
  { title: "Perfil", url: "/profile", icon: Users },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    operacional: true,
    financeiro: true,
    recursos: true,
  });

  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/auth", replace: true });
  };

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const profileName = useMemo(
    () => user?.user_metadata?.full_name ?? user?.email ?? "Operador",
    [user],
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar shadow-[0_0_30px_-12px_rgba(0,0,0,0.35)]">
      <SidebarHeader className="border-b border-sidebar-border/70 px-4 py-5">
        <div className="flex items-center gap-3">
          <AbcunaBrand size="sm" showText={!collapsed} />
        </div>
        {!collapsed && (
          <div className="mt-4 rounded-2xl bg-sidebar-accent/80 px-3 py-2 text-xs uppercase tracking-[0.24em] text-sidebar-accent-foreground/80">
            Sistema Integrado de Gestão
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {sections.map((section) => {
          const open = openGroups[section.key];
          return (
            <SidebarGroup key={section.key}>
              <div className="relative">
                {!collapsed && (
                  <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
                    {section.label}
                  </SidebarGroupLabel>
                )}
                {!collapsed && (
                  <SidebarGroupAction asChild>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => toggleGroup(section.key)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
                      />
                    </button>
                  </SidebarGroupAction>
                )}
              </div>
              <SidebarGroupContent className={open || collapsed ? "" : "hidden"}>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const active = isActive(item.url);
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={collapsed ? item.title : undefined}
                          className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:border-l-2 data-[active=true]:border-primary"
                        >
                          <Link to={item.url} className="flex items-center gap-3">
                            <item.icon className="h-4 w-4 shrink-0" />
                            {!collapsed && <span className="font-medium">{item.title}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/70 px-4 py-4">
        {!collapsed && (
          <div className="mb-4 rounded-3xl border border-sidebar-border/70 bg-sidebar-accent/70 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-sm font-semibold text-primary">
                {initials(profileName)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{profileName}</p>
                <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        )}
        <div className="grid gap-2">
          {footerItems.map((item) => {
            const active = isActive(item.url);
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={collapsed ? item.title : undefined}
                  className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                >
                  <Link to={item.url} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="font-medium">{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={signOut}
            className="w-full justify-start gap-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && "Encerrar sessão"}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
