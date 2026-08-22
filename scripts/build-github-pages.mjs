import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "gh-pages-dist");
const repositoryName = (process.env.GITHUB_REPOSITORY ?? "nbmorphism/Personal-Website")
  .split("/")
  .at(-1);
const basePath = `/${repositoryName}/`;
const routes = [
  "",
  "research-interests",
  "publications",
  "notes-talks",
  "cv",
  "persona",
];

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Personal website of a mathematics student.">
    <base href="${basePath}">
    <title>Personal Website</title>
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <style>
      :root { background: #fff; }
      html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #fff; }
      main { position: fixed; inset: 0; overflow: hidden; background: #fff; }
      video { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; }
    </style>
  </head>
  <body>
    <main aria-label="Animated site background">
      <video autoplay loop muted playsinline preload="auto" aria-hidden="true">
        <source src="background.mp4" type="video/mp4">
      </video>
    </main>
  </body>
</html>
`;

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await copyFile(join(root, "public", "background.mp4"), join(output, "background.mp4"));
await copyFile(join(root, "public", "favicon.svg"), join(output, "favicon.svg"));
await writeFile(join(output, ".nojekyll"), "");

for (const route of routes) {
  const directory = join(output, route);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "index.html"), html);
}

await writeFile(join(output, "404.html"), html);

console.log(`Generated ${routes.length} routes in ${output}`);
