"use client";

import { useState } from "react";
import { getQrCodeUrl } from "@/lib/mvp-api";

interface QrCodeProps {
  /** The URL to encode in the QR code */
  url: string;
  /** Size in pixels (default 200) */
  size?: number;
  /** Output format (default svg) */
  format?: "svg" | "png";
  /** Optional label shown below the QR code */
  label?: string;
  /** CSS class name for the wrapper */
  className?: string;
}

/**
 * QrCode — renders a QR code image fetched from /api/v1/qr.
 * Used on booking confirmation pages and the studio "share link" panel.
 *
 * Example:
 *   <QrCode url="https://glamr.ro/business/sala-studio" label="Scan to book" />
 */
export function QrCode({ url, size = 200, format = "svg", label, className }: QrCodeProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const src = getQrCodeUrl({ url, format, size });

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-[var(--paper-3)] rounded-lg text-[11px] text-[var(--ink-4)] ${className ?? ""}`}
        style={{ width: size, height: size }}
      >
        QR unavailable
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className ?? ""}`}>
      {/* Skeleton while loading */}
      {!loaded && (
        <div
          className="bg-[var(--paper-3)] rounded-lg animate-pulse"
          style={{ width: size, height: size }}
          aria-hidden
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`QR code for ${url}`}
        width={size}
        height={size}
        className={`rounded-lg transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0 absolute"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
      {label && loaded && (
        <p className="text-[11px] text-[var(--ink-4)] text-center font-mono">{label}</p>
      )}
    </div>
  );
}
