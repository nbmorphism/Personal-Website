const transition = document.querySelector(".page-transition");
const description = document.querySelector(".self-description");
const links = [...document.querySelectorAll(".page-menu__link")];
let transitioning = false;

function routeFromLocation() {
  const base = new URL(document.baseURI).pathname.replace(/^\/|\/$/g, "");
  const path = window.location.pathname.replace(/^\/|\/$/g, "");
  return path === base ? "" : path.slice(base.length).replace(/^\/|\/$/g, "");
}

function renderRoute(route) {
  document.body.dataset.route = route;
  description.hidden = route !== "";

  for (const link of links) {
    if (link.dataset.route === route) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
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
    ) {
      return;
    }

    event.preventDefault();
    const route = link.dataset.route ?? "";
    if (transitioning || route === document.body.dataset.route) {
      return;
    }

    transitioning = true;
    transition.classList.add("page-transition--active");

    window.setTimeout(() => {
      window.history.pushState({}, "", link.href);
      renderRoute(route);
    }, 360);

    window.setTimeout(() => {
      transition.classList.remove("page-transition--active");
      transitioning = false;
    }, 880);
  });
}

window.addEventListener("popstate", () => renderRoute(routeFromLocation()));
renderRoute(routeFromLocation());
