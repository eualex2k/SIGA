import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: "vercel",
  },
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    server: {
      port: Number(process.env.VITE_PORT) || 5173,
    },
    // Injetar variáveis de ambiente para uso no código cliente (fallback)
    define: {
      "process.env.SUPABASE_URL": JSON.stringify(
        process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
      ),
      "process.env.SUPABASE_ANON_KEY": JSON.stringify(
        process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY,
      ),
    },
  },
});
