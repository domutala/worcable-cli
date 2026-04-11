import { build } from "esbuild";

const isProd = process.env.NODE_ENV === "production";

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  target: "node20",

  format: "cjs", // important pour ton CLI

  sourcemap: !isProd,
  minify: isProd,

  banner: {
    js: "#!/usr/bin/env node",
  },

  external: [
    // évite de bundle certains packages si besoin
  ],
});

console.log("✅ Build complete");