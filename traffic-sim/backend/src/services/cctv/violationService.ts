import type { ViolationEvent } from "../../models/CCTVNode";

const SAMPLE_PLATES = [
  "MH20AB1234",
  "DL01CD5678",
  "KA05EF9012",
  "TN09GH3456",
  "GJ12IJ7890",
];

export function detectViolation(
  cctvId: string,
  lat: number,
  lng: number
): ViolationEvent | null {
  const random = Math.random();

  if (random < 0.2) {
    const plate = SAMPLE_PLATES[Math.floor(Math.random() * SAMPLE_PLATES.length)];
    return {
      type: "VIOLATION",
      plate,
      timestamp: new Date(),
      cctvId,
      lat,
      lng,
    };
  }

  return null;
}
