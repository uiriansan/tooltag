import tailwindcss from "@tailwindcss/vite";
import adapter from "@sveltejs/adapter-node";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, loadEnv } from "vite";
import mkcert from "vite-plugin-mkcert";
import Icons from "unplugin-icons/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      port: parseInt(env.PORT) || 8080,
      strictPort: true,
      https: true,
      fs: {
        allow: ["data/uploads"],
      },
    },
    preview: {
      port: parseInt(env.PORT) || 8080,
    },
    plugins: [
      mkcert(), // Permitir https em LAN (necessário para acessar câmera)
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

        // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://svelte.dev/docs/kit/adapters for more information about adapters.
        adapter: adapter({ out: "deploy/build/" }),
      }),
    ],
  };
});
