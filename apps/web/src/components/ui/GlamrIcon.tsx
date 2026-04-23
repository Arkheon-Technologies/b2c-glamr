/**
 * GlamrIcon — stroke-style icon set for the GLAMR design system.
 * 18 icons as defined in §2.3 of the remake plan.
 * All use currentColor, 1.2 stroke width, 24×24 viewBox.
 */

import React from "react";

type IconName =
  | "search" | "pin" | "clock" | "chevron" | "heart" | "bell"
  | "plus" | "check" | "x" | "shield" | "grid" | "menu"
  | "map" | "dots" | "arrow" | "calendar" | "scissors" | "spark"
  | "star" | "share" | "filter" | "user" | "message" | "chart"
  | "settings" | "camera" | "wallet" | "gift" | "eye" | "percent";

interface GlamrIconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

const paths: Record<IconName, React.ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" fill="none" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </>
  ),
  pin: (
    <>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="none" />
      <circle cx="12" cy="9" r="2.5" fill="none" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" />
      <polyline points="12 7 12 12 15.5 14" fill="none" />
    </>
  ),
  chevron: <polyline points="9 6 15 12 9 18" fill="none" />,
  heart: (
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="none"
    />
  ),
  bell: (
    <>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="none" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" fill="none" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  check: <polyline points="5 12 10 17 19 7" fill="none" />,
  x: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  shield: (
    <path d="M12 2l7 4v5c0 4.52-2.98 8.69-7 10-4.02-1.31-7-5.48-7-10V6l7-4z" fill="none" />
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" fill="none" />
      <rect x="14" y="3" width="7" height="7" rx="1" fill="none" />
      <rect x="3" y="14" width="7" height="7" rx="1" fill="none" />
      <rect x="14" y="14" width="7" height="7" rx="1" fill="none" />
    </>
  ),
  menu: (
    <>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>
  ),
  map: (
    <>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" fill="none" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </>
  ),
  dots: (
    <>
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
      <circle cx="5" cy="12" r="1" fill="currentColor" />
    </>
  ),
  arrow: (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" fill="none" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" fill="none" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="6" r="3" fill="none" />
      <circle cx="6" cy="18" r="3" fill="none" />
      <line x1="20" y1="4" x2="8.58" y2="15.42" />
      <line x1="14.5" y1="12.5" x2="20" y2="20" />
      <line x1="8.58" y1="8.58" x2="10" y2="10" />
    </>
  ),
  spark: (
    <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" fill="none" />
  ),
  star: (
    <polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      fill="none"
    />
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" fill="none" />
      <circle cx="6" cy="12" r="3" fill="none" />
      <circle cx="18" cy="19" r="3" fill="none" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </>
  ),
  filter: (
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" fill="none" />
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" />
      <circle cx="12" cy="7" r="4" fill="none" />
    </>
  ),
  message: (
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" fill="none" />
  ),
  chart: (
    <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" fill="none" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        fill="none"
      />
    </>
  ),
  camera: (
    <>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11z" fill="none" />
      <circle cx="12" cy="13" r="4" fill="none" />
    </>
  ),
  wallet: (
    <>
      <rect x="2" y="5" width="20" height="16" rx="2" fill="none" />
      <path d="M2 10h20" />
      <circle cx="17" cy="15" r="1" fill="currentColor" />
    </>
  ),
  gift: (
    <>
      <polyline points="20 12 20 22 4 22 4 12" fill="none" />
      <rect x="2" y="7" width="20" height="5" fill="none" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" fill="none" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" fill="none" />
    </>
  ),
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" />
      <circle cx="12" cy="12" r="3" fill="none" />
    </>
  ),
  percent: (
    <>
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" fill="none" />
      <circle cx="17.5" cy="17.5" r="2.5" fill="none" />
    </>
  ),
};

export function GlamrIcon({ name, size = 18, className = "", strokeWidth = 1.2, style }: GlamrIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
