"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const PAGE_TRANSITION_EVENT = "personal-site:navigate";

type PageTransitionDetail = {
  href: string;
};

export default function PageTransition() {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const isRunning = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const beginTransition = (event: Event) => {
      if (isRunning.current) {
        return;
      }

      const { href } = (event as CustomEvent<PageTransitionDetail>).detail;
      isRunning.current = true;
      setIsActive(true);

      timers.current.push(
        window.setTimeout(() => router.push(href), 360),
        window.setTimeout(() => {
          setIsActive(false);
          isRunning.current = false;
          timers.current = [];
        }, 880),
      );
    };

    window.addEventListener(PAGE_TRANSITION_EVENT, beginTransition);

    return () => {
      window.removeEventListener(PAGE_TRANSITION_EVENT, beginTransition);
      timers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, [router]);

  return (
    <div
      className={`page-transition${isActive ? " page-transition--active" : ""}`}
      aria-hidden="true"
    >
      <span className="page-transition__plane page-transition__plane--blue" />
      <span className="page-transition__plane page-transition__plane--white" />
      <span className="page-transition__plane page-transition__plane--purple" />
      <span className="page-transition__plane page-transition__plane--ink" />
    </div>
  );
}
