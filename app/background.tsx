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
    href: "/publications",
    label: "Publications",
    angle: "2.2deg",
    shift: "0.6rem",
    rise: "0.15rem",
  },
  {
    href: "/notes-talks",
    label: "Notes & Talks",
    angle: "-2.8deg",
    shift: "0.15rem",
    rise: "0.06rem",
  },
  {
    href: "/personae",
    label: "Personae",
    angle: "3deg",
    shift: "0.8rem",
    rise: "0.12rem",
  },
  { href: "/cv", label: "CV", angle: "-2deg", shift: "0.35rem", rise: "0.08rem" },
] as const;

const pageContent = {
  "/": {
    layout: "home",
    eyebrow: "About me",
    title: "Ting-Yueh Chang",
    paragraphs: [
      "I am interested in number theory and arithmetic geometry.",
      "My current work explores the geometric interpretations and the cohomological structures behind exponential sums.",
    ],
  },
  "/publications": {
    layout: "catalogue",
    eyebrow: "Selected writing",
    title: "Publications",
    intro: "A developing catalogue of research and mathematical writing.",
    entries: [
      {
        label: "Research papers",
        text: "Original articles and preprints will be indexed here.",
      },
      {
        label: "Expository writing",
        text: "Longer notes that develop ideas beyond a seminar or lecture.",
      },
    ],
  },
  "/notes-talks": {
    layout: "index",
    eyebrow: "Archive",
    title: "Notes & Talks",
    intro: "Working notes, seminar material, and slides—kept in one quiet index.",
    entries: [
      {
        label: "Notes",
        text: "Reading notes and short mathematical expositions.",
      },
      {
        label: "Talks",
        text: "Slides, abstracts, and material prepared for seminars.",
      },
    ],
  },
  "/personae": {
    layout: "personae",
    eyebrow: "Personae",
    title: "People & Perspectives",
    intro: "A small archive of the people, places, and ideas behind the mathematics.",
    entries: [
      {
        label: "People",
        text: "Profiles and conversations that have shaped how I think.",
      },
      {
        label: "Perspectives",
        text: "Reflections on mathematical taste, practice, and discovery.",
      },
    ],
  },
  "/cv": {
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

      <section
        className={"self-description self-description--" + content.layout}
        aria-labelledby="page-heading"
      >
        <div className="self-description__inner">
          <header className="page-content__header">
            <p className="self-description__eyebrow">{content.eyebrow}</p>
            <h1 id="page-heading">{content.title}</h1>
            {content.layout === "home" ? null : (
              <p className="page-content__intro">{content.intro}</p>
            )}
          </header>

          {content.layout === "home" ? (
            <div className="self-description__body">
              {content.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <div className="page-content__entries">
              {content.entries.map((entry, index) => (
                <article className="page-content__entry" key={entry.label}>
                  <span className="page-content__number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2>{entry.label}</h2>
                  <p>{entry.text}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
