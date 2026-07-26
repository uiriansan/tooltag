import tailwindcss from "@tailwindcss/vite";
import adapter from "@sveltejs/adapter-node";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, loadEnv } from "vite";
import mkcert from "vite-plugin-mkcert";
import Icons from "unplugin-icons/vite";
import fs from "node:fs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    server: {
      port: parseInt(env.VITE_PORT) || 3000,
      strictPort: true,
      https: parseInt(env.VITE_USE_HTTPS) === 1,
      fs: {
        allow: ["data/uploads"],
      },
    },
    preview: {
      port: parseInt(env.VITE_PORT) || 3000,
    },
    plugins: [
      // Permitir https em LAN (necessário para acessar câmera):
      parseInt(env.VITE_USE_HTTPS) === 1 &&
        mkcert({
          hosts: env.VITE_HTTPS_HOSTS.split(","),
        }),
      Icons({
        compiler: "svelte",
      }),
      tailwindcss(),
      sveltekit({
        compilerOptions: {
          // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
          runes: ({ filename }) =>
            filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
        },
        adapter: adapter({ out: "build/" }),
      }),
    ],
  };
});
