import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import * as devCerts from "office-addin-dev-certs";

const sharedRoot = path.resolve(__dirname, "../syntax-highlighter-shared/src");
const nodeModulesRoot = path.resolve(__dirname, "node_modules");

export default defineConfig(async ({ command }) => {
  const https =
    command !== "serve" || process.env.OFFICE_ADDIN_HTTPS === "false"
      ? undefined
      : await devCerts.getHttpsServerOptions();

  return {
    plugins: [react()],
    resolve: {
      alias: [
        { find: "@syntax-highlighter/shared", replacement: sharedRoot },
        { find: /^react$/, replacement: path.resolve(nodeModulesRoot, "react") },
        {
          find: /^react\/(.*)$/,
          replacement: path.resolve(nodeModulesRoot, "react/$1"),
        },
        { find: /^shiki$/, replacement: path.resolve(nodeModulesRoot, "shiki/dist/index.mjs") },
      ],
    },
    server: {
      host: "127.0.0.1",
      port: 3001,
      https,
      fs: {
        allow: [path.resolve(__dirname), path.resolve(__dirname, "../syntax-highlighter-shared")],
      },
    },
    preview: {
      host: "127.0.0.1",
      port: 5001,
      https,
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      rollupOptions: {
        input: path.resolve(__dirname, "taskpane.html"),
      },
    },
  };
});
