"use client";

import { useRouter } from "next/navigation";
import { type CSSProperties, useEffect, useRef, useState } from "react";

export const PAGE_TRANSITION_EVENT = "personal-site:navigate";

type PageTransitionDetail = {
  href: string;
  x: number;
  y: number;
};

export default function PageTransition() {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [origin, setOrigin] = useState({ x: "50%", y: "50%" });
  const isRunning = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const beginTransition = (event: Event) => {
      if (isRunning.current) {
        return;
      }

      const { href, x, y } = (event as CustomEvent<PageTransitionDetail>).detail;
      isRunning.current = true;
      setOrigin({ x: `${x}px`, y: `${y}px` });
      setIsActive(true);

      timers.current.push(
        window.setTimeout(() => router.push(href), 320),
        window.setTimeout(() => {
          setIsActive(false);
          isRunning.current = false;
          timers.current = [];
        }, 820),
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
      style={
        {
          "--transition-x": origin.x,
          "--transition-y": origin.y,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <span className="page-transition__cyan" />
      <span className="page-transition__lines">
        {[
          ["8%", "-8deg", "45ms"],
          ["19%", "5deg", "100ms"],
          ["31%", "-3deg", "15ms"],
          ["44%", "10deg", "125ms"],
          ["56%", "-6deg", "70ms"],
          ["68%", "3deg", "155ms"],
          ["80%", "-11deg", "30ms"],
          ["91%", "7deg", "95ms"],
        ].map(([y, angle, delay]) => (
          <span
            className="page-transition__line"
            key={`${y}-${angle}`}
            style={
              {
                "--line-y": y,
                "--line-angle": angle,
                "--line-delay": delay,
              } as CSSProperties
            }
          />
        ))}
      </span>
    </div>
  );
}
