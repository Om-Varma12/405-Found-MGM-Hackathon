import type { LatLng } from "../routing/hybridRouting";
import type { CCTVNode } from "../../models/CCTVNode";

export function generateCCTVNodes(path: LatLng[]): CCTVNode[] {
  return path.map((point, index) => ({
    id: `S${index}`,
    lat: point[0],
    lng: point[1],
    status: "IDLE",
    lastUpdate: new Date(),
    assignedRouteId: undefined,
  }));
}
