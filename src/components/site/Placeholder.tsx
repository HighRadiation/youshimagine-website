"use client";

import { useState } from "react";
import type { Work } from "@/lib/works";

type Props = {
  work: Pick<Work, "ph" | "w" | "h" | "id" | "dimensions"> & { image?: string };
  tag?: string | false;
  className?: string;
  style?: React.CSSProperties;
};

export function Placeholder({ work, tag, className = "", style }: Props) {
  const { a, b, c, angle } = work.ph;
  const ratio = (work.h / work.w) * 100;
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`ph ${className}`}
      style={{
        ...style,
        paddingTop: `${ratio}%`,
        ["--ph-a" as string]: a,
        ["--ph-b" as string]: b,
        ["--ph-bg" as string]: c,
        ["--ph-angle" as string]: angle,
      }}
      aria-hidden="true"
    >
      {work.image && (
        <img
          src={work.image}
          alt=""
          onLoad={() => setLoaded(true)}
          loading="lazy"
          decoding="async"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity 600ms ease",
            zIndex: 1,
          }}
        />
      )}
      {tag !== false && (
        <div className="ph-tag">{tag || `${work.id} · ${work.dimensions}`}</div>
      )}
    </div>
  );
}
