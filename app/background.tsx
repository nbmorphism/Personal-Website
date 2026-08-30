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

const homeContent = {
  eyebrow: "An Introduction to",
  title: "Ting-Yueh Chang",
  paragraphs: [
    "I am a senior undergraduate student of mathematics at the National Taiwan University.",
    "I am interested in number theory, especially in arithmetic geometry.",
    "My current work explores the geometric interpretations and the cohomological structures behind exponential sums.",
  ],
} as const;

const publicationItems = [
  "Publications and preprints will be listed here.",
] as const;

const notesTalksItems = [
  "Notes and talks will be listed here.",
] as const;

type BackgroundProps = {
  activePath: string;
  showDescription?: boolean;
};

export default function Background({ activePath }: BackgroundProps) {
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

      <div className="blue-content-scroll" data-blue-scroll>
        {activePath === "/" ? (
          <section
            className="blue-content-panel self-description self-description--home"
            aria-labelledby="page-heading"
          >
            <div className="self-description__inner">
              <header className="page-content__header">
                <p className="self-description__eyebrow">{homeContent.eyebrow}</p>
                <h1 id="page-heading">{homeContent.title}</h1>
              </header>
              <div className="self-description__body">
                {homeContent.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activePath === "/publications" ? (
          <section
            className="blue-content-panel publication-page"
            aria-labelledby="publications-heading"
          >
            <div className="self-description__inner publication-page__inner">
              <h1 id="publications-heading">Publications &amp; Preprints</h1>
              <ul className="publication-page__list">
                {publicationItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {activePath === "/notes-talks" ? (
          <section
            className="blue-content-panel publication-page"
            aria-labelledby="notes-talks-heading"
          >
            <div className="self-description__inner publication-page__inner">
              <h1 id="notes-talks-heading">Notes &amp; Talks</h1>
              <ul className="publication-page__list">
                {notesTalksItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
