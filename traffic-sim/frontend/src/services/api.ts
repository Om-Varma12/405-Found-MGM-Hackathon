const API_BASE = "http://localhost:5000/api";

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  beds?: number;
  capacity?: number;
}

export interface LatLng {
  0: number;
  1: number;
}

export interface CCTVNode {
  id: string;
  lat: number;
  lng: number;
  status: string;
  lastUpdate?: string;
  assignedRouteId?: string;
}

export interface EventLog {
  id: string;
  timestamp: string;
  event: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface ViolationEvent {
  type: "VIOLATION";
  plate: string;
  timestamp: string;
  cctvId: string;
  lat: number;
  lng: number;
}

export interface WaypointNode {
  index: number;
  cctvId: string;
  coordinates: LatLng;
}

export interface SimulationWaypoints {
  source: WaypointNode;
  intermediate: WaypointNode[];
  destination: WaypointNode;
}

export interface SimulationResult {
  route: LatLng[];
  cctvs: CCTVNode[];
  logs: EventLog[];
  waypoints: SimulationWaypoints | null;
  violations: ViolationEvent[];
}

export async function getHospitals(): Promise<Hospital[]> {
  const res = await fetch(`${API_BASE}/hospitals`);
  if (!res.ok) throw new Error(`Failed to fetch hospitals: ${res.status}`);
  return res.json();
}

export async function startSimulation(
  source: Hospital,
  destination: Hospital
): Promise<SimulationResult> {
  const res = await fetch(`${API_BASE}/simulation/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: [source.lat, source.lng],
      destination: [destination.lat, destination.lng],
    }),
  });
  if (!res.ok) throw new Error(`Simulation failed: ${res.status}`);
  return res.json();
}
