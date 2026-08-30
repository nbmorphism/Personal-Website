import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "gh-pages-dist");
const repositoryName = (process.env.GITHUB_REPOSITORY ?? "nbmorphism/Personal-Website")
  .split("/")
  .at(-1);
const basePath = `/${repositoryName}/`;
const assetVersion = (process.env.GITHUB_SHA ?? "local").slice(0, 12);

const routes = [
  { path: "", label: "Home", angle: "-4deg", shift: "0rem", rise: "0rem" },
  {
    path: "publications",
    label: "Publications",
    angle: "2.2deg",
    shift: "0.6rem",
    rise: "0.15rem",
  },
  {
    path: "notes-talks",
    label: "Notes & Talks",
    angle: "-2.8deg",
    shift: "0.15rem",
    rise: "0.06rem",
  },
  {
    path: "personae",
    label: "Personae",
    angle: "3deg",
    shift: "0.8rem",
    rise: "0.12rem",
  },
  { path: "cv", label: "CV", angle: "-2deg", shift: "0.35rem", rise: "0.08rem" },
];

const navigation = routes
  .map(
    ({ path, label, angle, shift, rise }) => `
          <li class="page-menu__item" style="--menu-angle:${angle};--menu-shift:${shift};--menu-rise:${rise}">
            <a class="page-menu__link" href="${path ? `${path}/` : "./"}" data-route="${path}">
              <span class="page-menu__triangle-shadow" aria-hidden="true"></span>
              <span class="page-menu__label">${label}</span>
            </a>
          </li>`,
  )
  .join("");

const html = (route) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Personal website of a mathematics student.">
    <base href="${basePath}">
    <title>Personal Website</title>
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="site.css?v=${assetVersion}">
    <script src="site.js?v=${assetVersion}" defer></script>
  </head>
  <body data-route="${route}">
    <main class="background" aria-label="Animated site background">
      <svg class="boundary-defs" aria-hidden="true">
        <defs>
          <clipPath id="mobile-white-boundary" clipPathUnits="objectBoundingBox">
            <path d="M0 0 H1 V0.88 C0.72 0.86 0.38 0.77 0 0.76 Z"></path>
          </clipPath>
        </defs>
      </svg>

      <div class="background__water" aria-hidden="true">
        <video class="background__video" autoplay loop muted playsinline preload="auto">
          <source src="background.mp4" type="video/mp4">
        </video>
      </div>

      <nav class="page-menu" aria-label="Primary navigation">
        <ul class="page-menu__list">${navigation}
        </ul>
      </nav>

      <div class="blue-content-scroll" data-blue-scroll>
        <section class="blue-content-panel self-description self-description--home"${route ? " hidden" : ""} data-content-route="" aria-labelledby="page-heading">
          <div class="self-description__inner">
            <header class="page-content__header">
              <p class="self-description__eyebrow">An Introduction to</p>
              <h1 id="page-heading">Ting-Yueh Chang</h1>
            </header>
            <div class="self-description__body">
              <p>I am a senior undergraduate student of mathematics at the National Taiwan University.</p>
              <p>I am interested in number theory, especially in arithmetic geometry.</p>
              <p>My current work explores the geometric interpretations and the cohomological structures behind exponential sums.</p>
            </div>
          </div>
        </section>

        <section class="blue-content-panel publication-page"${route === "publications" ? "" : " hidden"} data-content-route="publications" aria-labelledby="publications-heading">
          <div class="self-description__inner publication-page__inner">
            <h1 id="publications-heading">Publications &amp; Preprints</h1>
            <ul class="publication-page__list">
              <li>Publications and preprints will be listed here.</li>
            </ul>
          </div>
        </section>

        <section class="blue-content-panel publication-page"${route === "notes-talks" ? "" : " hidden"} data-content-route="notes-talks" aria-labelledby="notes-talks-heading">
          <div class="self-description__inner publication-page__inner">
            <h1 id="notes-talks-heading">Notes &amp; Talks</h1>
            <ul class="publication-page__list">
              <li>Notes and talks will be listed here.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>

    <div class="page-transition" aria-hidden="true">
      <span class="page-transition__cyan"></span>
      <span class="page-transition__lines"></span>
    </div>
  </body>
</html>
`;

await rm(output, { recursive: true, force: true });
await mkdir(join(output, "fonts"), { recursive: true });
await copyFile(join(root, "public", "background.mp4"), join(output, "background.mp4"));
await copyFile(join(root, "public", "favicon.svg"), join(output, "favicon.svg"));
await copyFile(
  join(root, "public", "fonts", "noto-serif-regular.woff2"),
  join(output, "fonts", "noto-serif-regular.woff2"),
);
await copyFile(join(root, "scripts", "github-pages", "site.css"), join(output, "site.css"));
await copyFile(join(root, "scripts", "github-pages", "site.js"), join(output, "site.js"));
await writeFile(join(output, ".nojekyll"), "");

for (const { path } of routes) {
  const directory = join(output, path);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "index.html"), html(path));
}

await writeFile(join(output, "404.html"), html(""));

const generatedCss = await readFile(join(output, "site.css"), "utf8");
if (!generatedCss.includes("page-menu__triangle-shadow")) {
  throw new Error("The generated stylesheet is incomplete.");
}

console.log(`Generated ${routes.length} complete routes in ${output}`);
