"use client";

import { useEffect, useRef, useCallback } from "react";
import type { DiscoverBusiness } from "@/lib/mvp-api";

interface MapBounds {
  sw: { lat: number; lng: number };
  ne: { lat: number; lng: number };
}

interface BusinessMapProps {
  businesses: DiscoverBusiness[];
  onViewportChange?: (bbox: string) => void;
  className?: string;
}

// Bucharest default center
const DEFAULT_CENTER: [number, number] = [44.4268, 26.1025];
const DEFAULT_ZOOM = 12;

export function BusinessMap({ businesses, onViewportChange, className = "" }: BusinessMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);

  const initMap = useCallback(async () => {
    if (!containerRef.current || mapRef.current) return;

    const mapboxgl = (await import("mapbox-gl")).default;
    await import("mapbox-gl/dist/mapbox-gl.css");

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.warn("NEXT_PUBLIC_MAPBOX_TOKEN is not set — map disabled");
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current!,
      style: "mapbox://styles/mapbox/light-v11",
      center: [DEFAULT_CENTER[1], DEFAULT_CENTER[0]], // [lng, lat]
      zoom: DEFAULT_ZOOM,
    });

    // Override map background to match --paper
    map.on("style.load", () => {
      map.setPaintProperty("background", "background-color", "#F7F4EE");
    });

    map.on("dragend", () => {
      if (!onViewportChange) return;
      const bounds = map.getBounds();
      if (!bounds) return;
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;
      onViewportChange(bbox);
    });

    mapRef.current = map;
  }, [onViewportChange]);

  // Init map on mount
  useEffect(() => {
    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initMap]);

  // Sync markers whenever businesses changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;

      for (const biz of businesses) {
        const loc = biz.location as (typeof biz.location & { lat?: number; lng?: number }) | null;
        if (!loc?.lat || !loc?.lng) continue;

        // Popup content
        const popup = new mapboxgl.Popup({ offset: 12, closeButton: false }).setHTML(`
          <div style="font-family: Geist, sans-serif; min-width: 160px;">
            <p style="font-weight: 600; font-size: 13px; margin: 0 0 4px;">${biz.name}</p>
            <p style="font-size: 11px; color: #666; margin: 0 0 8px;">${loc.city}${loc.neighborhood ? ` · ${loc.neighborhood}` : ""}</p>
            <a href="/b/${biz.slug}" style="font-size: 12px; color: #7C3AED; text-decoration: none; font-weight: 500;">Book →</a>
          </div>
        `);

        // Marker element — plum dot
        const el = document.createElement("div");
        el.style.cssText = `
          width: 12px; height: 12px; border-radius: 50%;
          background: var(--plum, #7C3AED);
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          cursor: pointer;
          transition: transform 0.15s cubic-bezier(0.2,0.7,0.3,1);
        `;
        el.addEventListener("mouseenter", () => { el.style.transform = "translateY(-2px) scale(1.3)"; });
        el.addEventListener("mouseleave", () => { el.style.transform = ""; });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([loc.lng, loc.lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      }
    })();
  }, [businesses]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%", minHeight: 400 }}
    />
  );
}
