"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Icon, Map as LeafletMap } from "leaflet";
import { cn } from "@/lib/utils";
import { Section } from "../../components/Section";
import { Container } from "../../components/Container";

export interface MapSectionProps {
  /** Map center coordinates [lat, lng] */
  coordinates: [number, number];
  /** Custom marker icon URL */
  markerIcon?: string;
  /** Popup text when clicking marker */
  popupText?: string;
  /** Initial zoom level */
  zoom?: number;
  /** Map container height */
  height?: string;
  /** Fallback text while loading */
  fallbackText?: string;
  /** Custom className */
  className?: string;
}

export function MapSection({
  coordinates,
  markerIcon = "/dt-blue.svg",
  popupText,
  zoom = 20,
  height = "400px",
  fallbackText,
  className,
}: MapSectionProps) {
  const { t } = useTranslation();
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // CRITICAL: This cleanup logic handles React StrictMode and Fast Refresh
  // DO NOT simplify or remove - it prevents "Map container is already initialized" errors
  const clearMapContainer = () => {
    mapRef.current?.remove();
    mapRef.current = null;
    const container = mapContainerRef.current as
      | (HTMLDivElement & { _leaflet_id?: string })
      | null;
    if (container?._leaflet_id) {
      delete container._leaflet_id;
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Fresh container each mount (handles Fast Refresh/StrictMode replays)
    clearMapContainer();

    let mounted = true;

    (async () => {
      const leafletCore = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      const L = (leafletCore as unknown as { default?: typeof leafletCore }).default ?? leafletCore;
      if (typeof L?.map !== "function") {
        // In non-browser/test environments, bail out gracefully
        return;
      }

      const iconOptions = (L.Icon as typeof Icon).Default.prototype.options;
      if (!iconOptions.iconRetinaUrl) {
        (L.Icon as typeof Icon).Default.mergeOptions({
          iconRetinaUrl: "/marker-icon-2x.png",
          iconUrl: "/marker-icon.png",
          shadowUrl: "/marker-shadow.png",
        });
      }

      if (!mounted) return;
      const container = mapContainerRef.current;
      if (!container) return;

      // Ensure Leaflet doesn't think this container is already bound
      if ((container as { _leaflet_id?: string })._leaflet_id) {
        delete (container as { _leaflet_id?: string })._leaflet_id;
      }

      const map = L.map(container, {
        scrollWheelZoom: true,
      }).setView(coordinates, zoom);

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {}
      ).addTo(map);

      // Create custom marker if icon provided
      const icon = L.icon({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon,
        iconSize: [44, 44],
        iconAnchor: [22, 40], // bottom center anchors the tip
        popupAnchor: [0, -32],
      });

      const marker = L.marker(coordinates, { icon }).addTo(map);

      // Add popup if text provided
      if (popupText) {
        marker.bindPopup(popupText);
      }

      mapRef.current = map;
      setIsMapReady(true);
    })();

    return () => {
      mounted = false;
      clearMapContainer();
      setIsMapReady(false);
    };
  }, [coordinates, markerIcon, popupText, zoom]);

  const resolvedFallback = fallbackText || t("contactMapFallback");

  return (
    <Section spacing="none" className={className}>
      <Container size="lg">
        <div
          className={cn(
            "relative rounded-lg overflow-hidden",
            "ring-1 ring-border"
          )}
          style={{ height }}
          aria-label={popupText || t("contactHelsinkiOffice")}
        >
          <div
            ref={mapContainerRef}
            className="absolute inset-0"
            role="img"
            aria-label={popupText || t("contactHelsinkiOffice")}
          />
          {!isMapReady && (
            <div
              className={cn(
                "absolute inset-0",
                "flex items-center justify-center",
                "bg-muted text-muted-foreground",
                "font-body text-sm"
              )}
            >
              {resolvedFallback}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

MapSection.displayName = "MapSection";
