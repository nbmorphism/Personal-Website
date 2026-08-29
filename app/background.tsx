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

const pageContent = {
  "/": {
    eyebrow: "About me",
    title: "A student of mathematics",
    paragraphs: [
      "I am interested in algebraic geometry and arithmetic geometry.",
      "My current work explores étale cohomology and the cohomological structures behind exponential sums.",
    ],
  },
  "/research-interests": {
    eyebrow: "Research",
    title: "Research Interests",
    paragraphs: [
      "My interests lie in algebraic geometry and arithmetic geometry.",
      "I am currently studying étale cohomology, exponential sums, and the geometry of twisted Kloosterman moments.",
    ],
  },
  "/publications": {
    eyebrow: "Writing",
    title: "Publications",
    paragraphs: [
      "Research papers and related writing will be collected on this page.",
      "Full bibliographic details and links will be added as the work becomes available.",
    ],
  },
  "/notes-talks": {
    eyebrow: "Exposition",
    title: "Notes & Talks",
    paragraphs: [
      "Expository notes, seminar materials, and slides will be collected here.",
      "Each entry will include a short description and a link to the corresponding file.",
    ],
  },
  "/personae": {
    eyebrow: "Personae",
    title: "People & Perspectives",
    paragraphs: [
      "This page is reserved for the people, voices, and mathematical perspectives that shape my work.",
      "Profiles and related reflections will be added here.",
    ],
  },
  "/cv": {
    eyebrow: "Curriculum Vitae",
    title: "CV",
    paragraphs: [
      "Education, research experience, teaching, and academic activities will be presented here.",
      "A downloadable curriculum vitae will be added when the details are ready.",
    ],
  },
} as const;

type BackgroundProps = {
  activePath: string;
  showDescription?: boolean;
};

export default function Background({ activePath }: BackgroundProps) {
  const content = pageContent[activePath as keyof typeof pageContent] ?? pageContent["/"];
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
      <svg className="boundary-defs" aria-hidden="true">
        <defs>
          <clipPath id="mobile-white-boundary" clipPathUnits="objectBoundingBox">
            <path d="M0 0 H1 V0.88 C0.72 0.86 0.38 0.77 0 0.76 Z" />
          </clipPath>
        </defs>
      </svg>

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

      <section className="self-description" aria-labelledby="about-heading">
        <div className="self-description__inner">
          <p className="self-description__eyebrow">{content.eyebrow}</p>
          <h1 id="about-heading">{content.title}</h1>
          <div className="self-description__body">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
