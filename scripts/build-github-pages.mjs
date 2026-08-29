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
    path: "research-interests",
    label: "Research Interests",
    angle: "2.8deg",
    shift: "0.7rem",
    rise: "0.24rem",
  },
  {
    path: "publications",
    label: "Publications",
    angle: "-2.5deg",
    shift: "0.15rem",
    rise: "-0.14rem",
  },
  {
    path: "notes-talks",
    label: "Notes & Talks",
    angle: "3.6deg",
    shift: "0.9rem",
    rise: "0.24rem",
  },
  {
    path: "personae",
    label: "Personae",
    angle: "-3.1deg",
    shift: "0.3rem",
    rise: "-0.16rem",
  },
  { path: "cv", label: "CV", angle: "-2deg", shift: "1.1rem", rise: "0rem" },
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

      <section class="self-description" aria-labelledby="about-heading">
        <div class="self-description__inner">
          <p class="self-description__eyebrow">About me</p>
          <h1 id="about-heading">A student of mathematics</h1>
          <div class="self-description__body">
            <p>I am interested in algebraic geometry and arithmetic geometry.</p>
            <p>My current work explores étale cohomology and the cohomological structures behind exponential sums.</p>
          </div>
        </div>
      </section>
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
