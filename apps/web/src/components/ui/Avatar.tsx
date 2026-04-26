"use client";

import React from "react";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string;
  name: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
};

const fontSizeMap: Record<AvatarSize, string> = {
  sm: "10px",
  md: "13px",
  lg: "16px",
  xl: "22px",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const px = sizeMap[size];
  const fs = fontSizeMap[size];
  const initials = getInitials(name);

  const sharedStyle: React.CSSProperties = {
    width: px,
    height: px,
    minWidth: px,
    borderRadius: "50%",
    overflow: "hidden",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={{ ...sharedStyle, objectFit: "cover" }}
        className={className}
        width={px}
        height={px}
      />
    );
  }

  return (
    <span
      style={{
        ...sharedStyle,
        background: "var(--paper-2, #EDE9E0)",
        color: "var(--ink)",
        fontFamily: "var(--font-geist-sans, Geist, sans-serif)",
        fontWeight: 500,
        fontSize: fs,
        letterSpacing: "0.02em",
        userSelect: "none",
      }}
      className={className}
      aria-label={name}
      title={name}
    >
      {initials}
    </span>
  );
}
