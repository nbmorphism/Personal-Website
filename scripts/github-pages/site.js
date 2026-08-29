const pageContent = {
  "": {
    eyebrow: "About me",
    title: "A student of mathematics",
    paragraphs: [
      "I am interested in algebraic geometry and arithmetic geometry.",
      "My current work explores étale cohomology and the cohomological structures behind exponential sums.",
    ],
  },
  "research-interests": {
    eyebrow: "Research",
    title: "Research Interests",
    paragraphs: [
      "My interests lie in algebraic geometry and arithmetic geometry.",
      "I am currently studying étale cohomology, exponential sums, and the geometry of twisted Kloosterman moments.",
    ],
  },
  publications: {
    eyebrow: "Writing",
    title: "Publications",
    paragraphs: [
      "Research papers and related writing will be collected on this page.",
      "Full bibliographic details and links will be added as the work becomes available.",
    ],
  },
  "notes-talks": {
    eyebrow: "Exposition",
    title: "Notes & Talks",
    paragraphs: [
      "Expository notes, seminar materials, and slides will be collected here.",
      "Each entry will include a short description and a link to the corresponding file.",
    ],
  },
  personae: {
    eyebrow: "Personae",
    title: "People & Perspectives",
    paragraphs: [
      "This page is reserved for the people, voices, and mathematical perspectives that shape my work.",
      "Profiles and related reflections will be added here.",
    ],
  },
  cv: {
    eyebrow: "Curriculum Vitae",
    title: "CV",
    paragraphs: [
      "Education, research experience, teaching, and academic activities will be presented here.",
      "A downloadable curriculum vitae will be added when the details are ready.",
    ],
  },
};

const transition = document.querySelector(".page-transition");
const description = document.querySelector(".self-description");
const eyebrow = description.querySelector(".self-description__eyebrow");
const heading = description.querySelector("h1");
const body = description.querySelector(".self-description__body");
const links = [...document.querySelectorAll(".page-menu__link")];
const lines = document.querySelector(".page-transition__lines");
let transitioning = false;

[
  ["8%", "-8deg", "45ms"],
  ["19%", "5deg", "100ms"],
  ["31%", "-3deg", "15ms"],
  ["44%", "10deg", "125ms"],
  ["56%", "-6deg", "70ms"],
  ["68%", "3deg", "155ms"],
  ["80%", "-11deg", "30ms"],
  ["91%", "7deg", "95ms"],
].forEach(([y, angle, delay]) => {
  const line = document.createElement("span");
  line.className = "page-transition__line";
  line.style.setProperty("--line-y", y);
  line.style.setProperty("--line-angle", angle);
  line.style.setProperty("--line-delay", delay);
  lines.append(line);
});

function routeFromLocation() {
  const base = new URL(document.baseURI).pathname.replace(/^\/|\/$/g, "");
  const path = window.location.pathname.replace(/^\/|\/$/g, "");
  return path === base ? "" : path.slice(base.length).replace(/^\/|\/$/g, "");
}

function renderRoute(route) {
  const content = pageContent[route] ?? pageContent[""];
  document.body.dataset.route = route;
  eyebrow.textContent = content.eyebrow;
  heading.textContent = content.title;
  body.replaceChildren(
    ...content.paragraphs.map((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      return paragraph;
    }),
  );

  for (const link of links) {
    link.toggleAttribute("aria-current", link.dataset.route === route);
    if (link.dataset.route === route) link.setAttribute("aria-current", "page");
  }
}

for (const link of links) {
  link.addEventListener("click", (event) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;

    event.preventDefault();
    const route = link.dataset.route ?? "";
    if (transitioning || route === document.body.dataset.route) return;

    transitioning = true;
    const originX = `${event.clientX}px`;
    const originY = `${event.clientY}px`;
    transition.style.setProperty("--transition-x", originX);
    transition.style.setProperty("--transition-y", originY);
    transition.classList.add("page-transition--active");

    window.setTimeout(() => {
      window.history.pushState({}, "", link.href);
      renderRoute(route);
    }, 320);

    window.setTimeout(() => {
      transition.classList.remove("page-transition--active");
      transitioning = false;
    }, 820);
  });
}

window.addEventListener("popstate", () => renderRoute(routeFromLocation()));
renderRoute(routeFromLocation());
