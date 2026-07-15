import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public-layout";

export const Route = createFileRoute("/_public")({
  component: PublicLayoutComponent,
});

function PublicLayoutComponent() {
  return <PublicLayout />;
}
