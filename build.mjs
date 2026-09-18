import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { rm, mkdir } from "node:fs/promises";

globalThis.require = createRequire(import.meta.url);

const rootDir = path.dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  const distDir = path.resolve(rootDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  const commonConfig = {
    platform: "node",
    bundle: true,
    format: "esm",
    target: "node20",
    logLevel: "info",
    external: [
      "fsevents"
    ],
    sourcemap: "linked",
    banner: {
      js: `import { createRequire as __crReq } from 'node:module';
const require = __crReq(import.meta.url);
`,
    },
  };

  // Build standalone server for Docker & local start
  await esbuild({
    ...commonConfig,
    entryPoints: [path.resolve(rootDir, "src/index.ts")],
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
