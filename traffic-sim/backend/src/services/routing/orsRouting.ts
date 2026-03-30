import { config } from "../../config/env";

export type LatLng = [number, number];

export interface RouteOption {
  index: number;
  path: LatLng[];
  distance: number;
  duration: number;
}

interface ORSFeature {
  geometry?: {
    coordinates?: number[][];
  };
  properties?: {
    summary?: {
      distance?: number;
      duration?: number;
    };
  };
}

interface ORSGeoJsonResponse {
  features?: ORSFeature[];
}

export async function fetchTruckRoutes(
  start: LatLng,
  end: LatLng,
  targetAlternatives = 3,
): Promise<RouteOption[]> {
  const response = await fetch(
    "https://api.openrouteservice.org/v2/directions/driving-hgv/geojson",
    {
      method: "POST",
      headers: {
        Authorization: config.orsApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [start[1], start[0]],
          [end[1], end[0]],
        ],
        alternative_routes: {
          target_count: targetAlternatives,
          share_factor: 0.6,
          weight_factor: 1.4,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouteService request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as ORSGeoJsonResponse;
  const features = Array.isArray(data.features) ? data.features : [];

  return features
    .map((feature, index) => {
      const rawCoords = Array.isArray(feature.geometry?.coordinates)
        ? feature.geometry?.coordinates
        : [];
      const path: LatLng[] = rawCoords
        .filter((coord) => Array.isArray(coord) && coord.length >= 2)
        .map((coord) => [coord[1], coord[0]]);

      const distance = feature.properties?.summary?.distance ?? Number.POSITIVE_INFINITY;
      const duration = feature.properties?.summary?.duration ?? Number.POSITIVE_INFINITY;

      return {
        index,
        path,
        distance,
        duration,
      };
    })
    .filter((route) => route.path.length > 0 && Number.isFinite(route.distance));
}
