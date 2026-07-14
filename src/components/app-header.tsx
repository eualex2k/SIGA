import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, ChevronDown, Moon, Search, Settings, Sun } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AbcunaBrand } from "@/components/abcuna-brand";
import { Breadcrumb } from "@/components/breadcrumb";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTheme } from "@/hooks/use-theme";
import { initials } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AppHeader({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { user } = useCurrentUser();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const themeIcon = useMemo(() => (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />), [theme]);
  const themeLabel = useMemo(() => (theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"), [theme]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/auth", replace: true });
  };

  const profileLabel = user?.user_metadata?.full_name ?? user?.email ?? "Operador";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <AbcunaBrand size="sm" />
        </div>

        <div className="hidden flex-1 items-center gap-4 lg:flex">
          <Breadcrumb />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onOpenSearch} title="Buscar (Ctrl+K)">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Notificações">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title={themeLabel}>
            {themeIcon}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full p-0">
                <Avatar>
                  {user?.user_metadata?.avatar_url ? (
                    <AvatarImage src={user.user_metadata.avatar_url as string} alt="Avatar" />
                  ) : (
                    <AvatarFallback>{initials(profileLabel)}</AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{profileLabel}</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => navigate({ to: "/profile" })}>Perfil</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate({ to: "/profile" })}>Configurações</DropdownMenuItem>
              <DropdownMenuItem onSelect={signOut}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mx-auto hidden max-w-[1600px] border-t border-border/60 px-4 py-2 sm:px-6 lg:block">
        <Breadcrumb />
      </div>
    </header>
  );
}
