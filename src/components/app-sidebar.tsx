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
      { title: "Mensalidades", url: "/fees", icon: Receipt },
      { title: "Financeiro", url: "/finance", icon: Wallet },
      { title: "Estoque", url: "/inventory", icon: Boxes },
      { title: "Funcionários", url: "/staff", icon: ShieldCheck },
      { title: "Escalas", url: "/shifts", icon: CalendarDays },
      { title: "Relatórios", url: "/reports", icon: FileBarChart },
      { title: "Capacitação", url: "/capacitacao", icon: BookOpen },
    ],
  },
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

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border/60 px-3 py-4">
        {collapsed ? (
          <AbcunaBrand size="sm" showText={false} />
        ) : (
          <AbcunaBrand size="md" />
        )}
      </SidebarHeader>

      <SidebarContent className="px-1">
        {sections.map((section) => {
          const open = openGroups[section.key];
          return (
            <SidebarGroup key={section.key}>
              <div className="relative">
                {!collapsed && (
                  <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
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
                          className="data-[active=true]:bg-primary/15 data-[active=true]:text-primary data-[active=true]:border-l-2 data-[active=true]:border-primary"
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

      <SidebarFooter className="border-t border-sidebar-border/60 p-3">
        {!collapsed && (
          <div className="mb-3 flex items-center gap-3 rounded-md border border-sidebar-border bg-sidebar-accent/40 p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-sm font-bold text-primary">
              {initials(user?.user_metadata?.full_name || user?.email)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{user?.user_metadata?.full_name || "Operador"}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
            </div>
            <Siren className="h-4 w-4 text-primary animate-pulse" />
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={signOut}
          className="w-full justify-start gap-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Encerrar sessão"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
