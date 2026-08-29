const transition = document.querySelector(".page-transition");
const contentArea = document.querySelector("[data-blue-scroll]");
const contentPanels = [...document.querySelectorAll("[data-content-route]")];
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
  document.body.dataset.route = route;
  contentArea.scrollTop = 0;

  for (const panel of contentPanels) {
    panel.hidden = panel.dataset.contentRoute !== route;
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
