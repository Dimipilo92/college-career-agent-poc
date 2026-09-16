import { build } from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";

const result = await build({
  entryPoints: ["src/ui/experiences/coach-results/coach-results.ts"],
  bundle: true,
  format: "iife",
  minify: true,
  outdir: "dist-assets",
  write: false
});

const javascript = result.outputFiles.find((file) => file.path.endsWith(".js"))?.text;
const css = result.outputFiles.find((file) => file.path.endsWith(".css"))?.text ?? "";
if (!javascript) throw new Error("The Career Coach results app did not produce JavaScript.");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Career Coach results</title>
    <style>${css}</style>
  </head>
  <body>
    <main id="app" aria-live="polite"></main>
    <script>${javascript.replaceAll("</script", "<\\/script")}</script>
  </body>
</html>`;

await fs.mkdir("dist", { recursive: true });
await fs.writeFile(path.join("dist", "coach-results.html"), html, "utf-8");