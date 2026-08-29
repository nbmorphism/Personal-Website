const pageContent = {
  "": {
    layout: "home",
    eyebrow: "About me",
    title: "Ting-Yueh Chang",
    paragraphs: [
      "I am a senior undergraduate student of mathematics at the National Taiwan University.",
      "I am interested in number theory and arithmetic geometry.",
      "My current work explores the geometric interpretations and the cohomological structures behind exponential sums.",
    ],
  },
  publications: {
    layout: "catalogue",
    eyebrow: "Selected writing",
    title: "Publications",
    intro: "A developing catalogue of research and mathematical writing.",
    entries: [
      { label: "Research papers", text: "Original articles and preprints will be indexed here." },
      { label: "Expository writing", text: "Longer notes that develop ideas beyond a seminar or lecture." },
    ],
  },
  "notes-talks": {
    layout: "index",
    eyebrow: "Archive",
    title: "Notes & Talks",
    intro: "Working notes, seminar material, and slides—kept in one quiet index.",
    entries: [
      { label: "Notes", text: "Reading notes and short mathematical expositions." },
      { label: "Talks", text: "Slides, abstracts, and material prepared for seminars." },
    ],
  },
  personae: {
    layout: "personae",
    eyebrow: "Personae",
    title: "People & Perspectives",
    intro: "A small archive of the people, places, and ideas behind the mathematics.",
    entries: [
      { label: "People", text: "Profiles and conversations that have shaped how I think." },
      { label: "Perspectives", text: "Reflections on mathematical taste, practice, and discovery." },
    ],
  },
  cv: {
    layout: "timeline",
    eyebrow: "Curriculum Vitae",
    title: "CV",
    intro: "A concise record of study, research, teaching, and academic activity.",
    entries: [
      { label: "Education", text: "Academic history and current study." },
      { label: "Research", text: "Projects, interests, and experience." },
      { label: "Activities", text: "Teaching, seminars, and talks." },
    ],
  },
};

const transition = document.querySelector(".page-transition");
const description = document.querySelector(".self-description");
const inner = description.querySelector(".self-description__inner");
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

function makeHeader(content) {
  const header = document.createElement("header");
  header.className = "page-content__header";

  const eyebrow = document.createElement("p");
  eyebrow.className = "self-description__eyebrow";
  eyebrow.textContent = content.eyebrow;

  const heading = document.createElement("h1");
  heading.id = "page-heading";
  heading.textContent = content.title;

  header.append(eyebrow, heading);

  if (content.layout !== "home") {
    const intro = document.createElement("p");
    intro.className = "page-content__intro";
    intro.textContent = content.intro;
    header.append(intro);
  }

  return header;
}

function renderRoute(route) {
  const content = pageContent[route] ?? pageContent[""];
  document.body.dataset.route = route;
  description.className = `self-description self-description--${content.layout}`;

  const header = makeHeader(content);

  if (content.layout === "home") {
    const body = document.createElement("div");
    body.className = "self-description__body";
    for (const text of content.paragraphs) {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      body.append(paragraph);
    }
    inner.replaceChildren(header, body);
  } else {
    const entries = document.createElement("div");
    entries.className = "page-content__entries";
    content.entries.forEach((entry, index) => {
      const article = document.createElement("article");
      article.className = "page-content__entry";

      const number = document.createElement("span");
      number.className = "page-content__number";
      number.setAttribute("aria-hidden", "true");
      number.textContent = String(index + 1).padStart(2, "0");

      const title = document.createElement("h2");
      title.textContent = entry.label;

      const text = document.createElement("p");
      text.textContent = entry.text;

      article.append(number, title, text);
      entries.append(article);
    });
    inner.replaceChildren(header, entries);
  }

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
