"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Icon, Map as LeafletMap } from "leaflet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin } from "lucide-react";

// Digitaltableteur Helsinki studio coordinates
const STUDIO_COORDINATES: [number, number] = [60.18762, 24.95267];
const STUDIO_ADDRESS = "Hämeentie 8 C, 00530 Helsinki";
const GOOGLE_MAPS_URL = `https://www.google.com/maps/dir/?api=1&destination=${STUDIO_COORDINATES[0]},${STUDIO_COORDINATES[1]}`;

export interface StudioMapProps {
  /** Compact mode for chat embedding */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * StudioMap - A compact, embeddable map showing Digitaltableteur studio location
 *
 * Designed for inline chat rendering with:
 * - Compact dimensions suitable for chat bubbles
 * - Direct link to Google Maps directions
 * - Lightweight lazy loading of Leaflet
 */
export function StudioMap({ compact = true, className }: StudioMapProps) {
  const { t } = useTranslation();
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

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

    clearMapContainer();
    let mounted = true;

    (async () => {
      const leafletCore = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      const L =
        (leafletCore as unknown as { default?: typeof leafletCore }).default ??
        leafletCore;
      if (typeof L?.map !== "function") return;

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

      if ((container as { _leaflet_id?: string })._leaflet_id) {
        delete (container as { _leaflet_id?: string })._leaflet_id;
      }

      const map = L.map(container, {
        scrollWheelZoom: false,
        zoomControl: !compact,
        dragging: !compact,
      }).setView(STUDIO_COORDINATES, compact ? 15 : 17);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "",
      }).addTo(map);

      const icon = L.icon({
        iconUrl: "/dt-marker.svg",
        iconRetinaUrl: "/dt-marker.svg",
        iconSize: [32, 32],
        iconAnchor: [16, 30],
        popupAnchor: [0, -24],
      });

      const marker = L.marker(STUDIO_COORDINATES, { icon }).addTo(map);
      marker.bindPopup(
        `<strong>Digitaltableteur</strong><br/>${STUDIO_ADDRESS}`,
      );

      mapRef.current = map;
      setIsMapReady(true);
    })();

    return () => {
      mounted = false;
      clearMapContainer();
      setIsMapReady(false);
    };
  }, [compact]);

  const height = compact ? "180px" : "300px";

  return (
    <div className={cn("w-full", className)}>
      {/* Map container */}
      <div
        className={cn(
          "relative rounded-lg overflow-hidden",
          "ring-1 ring-border",
          "mb-3",
        )}
        style={{ height }}
        aria-label={t("studioMapAriaLabel", "Digitaltableteur studio location")}
      >
        <div
          ref={mapContainerRef}
          className="absolute inset-0"
          role="img"
          aria-label={t(
            "studioMapAriaLabel",
            "Digitaltableteur studio location",
          )}
        />
        {!isMapReady && (
          <div
            className={cn(
              "absolute inset-0",
              "flex items-center justify-center",
              "bg-muted text-muted-foreground",
              "font-body text-sm",
            )}
          >
            {t("studioMapLoading", "Loading map…")}
          </div>
        )}
      </div>

      {/* Address and directions */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{STUDIO_ADDRESS}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild className="text-xs">
            <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer">
              <MapPin className="w-3 h-3 mr-1.5" />
              {t("studioMapDirections", "Get directions")}
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STUDIO_ADDRESS)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-3 h-3 mr-1.5" />
              {t("studioMapOpenMaps", "Open in Maps")}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

StudioMap.displayName = "StudioMap";

export default StudioMap;
