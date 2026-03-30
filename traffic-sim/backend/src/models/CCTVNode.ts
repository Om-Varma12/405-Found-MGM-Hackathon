export type CCTVStatus = "IDLE" | "TRACKING" | "VIOLATION" | "OFFLINE";

export interface CCTVNode {
  id: string;
  lat: number;
  lng: number;
  status: CCTVStatus;
  lastUpdate?: Date;
  assignedRouteId?: string;
}

export interface ViolationEvent {
  type: "VIOLATION";
  plate: string;
  timestamp: Date;
  cctvId: string;
  lat: number;
  lng: number;
}
