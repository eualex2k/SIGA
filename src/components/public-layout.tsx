import { Outlet } from "@tanstack/react-router";
import { PublicHeader } from "./public-header";
import { PublicFooter } from "./public-footer";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
