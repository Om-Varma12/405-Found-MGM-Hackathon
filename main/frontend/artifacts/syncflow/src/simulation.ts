import { CCTV, Direction, EventLog } from "./types";

export const INTERSECTIONS = [
  { id: "S6", name: "City Center" },
  { id: "S7", name: "Market Square" },
  { id: "S8", name: "Stadium Road" },
  { id: "S9", name: "South Gate" },
];

export const DIRECTIONS: Direction[] = ["N", "S", "E", "W"];

// Direction label: what the camera faces toward
export const FACING_LABEL: Record<Direction, string> = {
  N: "FACING SOUTH ▼",
  S: "FACING NORTH ▲",
  E: "FACING WEST ◀",
  W: "FACING EAST ▶",
};

export const ARM_LABEL: Record<Direction, string> = {
  N: "▲ NORTH ARM",
  S: "▼ SOUTH ARM",
  E: "▶ EAST ARM",
  W: "◀ WEST ARM",
};

export function createInitialCCTVs(): CCTV[] {
  const cctvs: CCTV[] = [];
  for (const intersection of INTERSECTIONS) {
    for (const dir of DIRECTIONS) {
      cctvs.push({
        id: `${intersection.id}-${dir}`,
        name: `${intersection.name} ${dir}`,
        intersectionId: intersection.id,
        intersectionName: intersection.name,
        direction: dir,
        status: "NORMAL",
        vehicleCount: Math.floor(Math.random() * 4) + 3,
        ambulanceDetected: false,
        confidence: null,
        route: [],
        eta: null,
        isCorridorActive: false,
        isSignalFault: false,
        isCameraGlitch: false,
        signalColor: "green",
      });
    }
  }
  return cctvs;
}

export function generatePlate(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const l1 = letters[Math.floor(Math.random() * letters.length)];
  const l2 = letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  const district = Math.floor(Math.random() * 47) + 1;
  return `MH${String(district).padStart(2, "0")}${l1}${l2}${num}`;
}

export function generateRoute(startIntersectionId: string): string[] {
  const others = INTERSECTIONS.filter((i) => i.id !== startIntersectionId).map((i) => i.id);
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  const length = Math.floor(Math.random() * 2) + 1;
  return [startIntersectionId, ...shuffled.slice(0, length)];
}

export function generateEmergencyId(): string {
  return `EM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function generateEventId(): string {
  return `EV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function generateFineId(): string {
  return `FN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function createEventLog(
  type: EventLog["type"],
  message: string,
  cctvId?: string
): EventLog {
  return {
    id: generateEventId(),
    timestamp: new Date(),
    type,
    message,
    cctvId,
  };
}
