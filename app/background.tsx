"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type MouseEvent,
} from "react";
import { PAGE_TRANSITION_EVENT } from "./page-transition";

const navigation = [
  { href: "/", label: "Home", angle: "-4deg", shift: "0rem", rise: "0rem" },
  {
    href: "/research-interests",
    label: "Research Interests",
    angle: "2.8deg",
    shift: "0.7rem",
    rise: "0.24rem",
  },
  {
    href: "/publications",
    label: "Publications",
    angle: "-2.5deg",
    shift: "0.15rem",
    rise: "-0.14rem",
  },
  {
    href: "/notes-talks",
    label: "Notes & Talks",
    angle: "3.6deg",
    shift: "0.9rem",
    rise: "0.24rem",
  },
  {
    href: "/personae",
    label: "Personae",
    angle: "-3.1deg",
    shift: "0.3rem",
    rise: "-0.16rem",
  },
  { href: "/cv", label: "CV", angle: "-2deg", shift: "1.1rem", rise: "0rem" },
] as const;

type BackgroundProps = {
  activePath: string;
  showDescription?: boolean;
};

export default function Background({
  activePath,
  showDescription = false,
}: BackgroundProps) {
  const followLink = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (href === activePath) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    window.dispatchEvent(
      new CustomEvent(PAGE_TRANSITION_EVENT, {
        detail: { href, x: event.clientX, y: event.clientY },
      }),
    );
  };

  return (
    <main className="background" aria-label="Animated site background">
      <div className="background__water" aria-hidden="true">
        <video
          className="background__video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>
      </div>

      <nav className="page-menu" aria-label="Primary navigation">
        <ul className="page-menu__list">
          {navigation.map((item) => {
            const isActive = activePath === item.href;

            return (
              <li
                className="page-menu__item"
                key={item.href}
                style={{
                  "--menu-angle": item.angle,
                  "--menu-shift": item.shift,
                  "--menu-rise": item.rise,
                } as CSSProperties}
              >
                <Link
                  className="page-menu__link"
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(event) => followLink(event, item.href)}
                >
                  <span className="page-menu__triangle-shadow" aria-hidden="true" />
                  <span className="page-menu__label">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {showDescription ? (
        <section className="self-description" aria-labelledby="about-heading">
          <p className="self-description__eyebrow">About me</p>
          <h1 id="about-heading">A student of mathematics</h1>
          <div className="self-description__body">
            <p>
              I am interested in algebraic geometry and arithmetic geometry.
            </p>
            <p>
              My current work explores étale cohomology and the cohomological
              structures behind exponential sums.
            </p>
          </div>
        </section>
      ) : null}

    </main>
  );
}
