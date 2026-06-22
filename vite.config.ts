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
  },
});

