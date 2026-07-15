import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  component: AuthRedirect,
  head: () => ({ meta: [{ title: "Redirecionando..." }] }),
});

function AuthRedirect() {
  return <Navigate to="/login" replace />;
}
