export type CCTVStatus = "NORMAL" | "HIGH_TRAFFIC" | "EMERGENCY";
export type SignalColor = "red" | "yellow" | "green";
export type Direction = "N" | "S" | "E" | "W";

export interface CCTV {
  id: string;
  name: string;
  intersectionId: string;
  intersectionName: string;
  direction: Direction;
  status: CCTVStatus;
  vehicleCount: number;
  ambulanceDetected: boolean;
  confidence: number | null;
  route: string[];
  eta: number | null;
  isCorridorActive: boolean;
  isSignalFault: boolean;
  isCameraGlitch: boolean;
  signalColor: SignalColor;
}

export interface Intersection {
  id: string;
  name: string;
}

export interface EventLog {
  id: string;
  timestamp: Date;
  type: "NORMAL" | "HIGH_TRAFFIC" | "EMERGENCY" | "ARRIVED" | "FINE" | "RESET" | "RUSH_HOUR" | "SIGNAL_FAULT" | "GLITCH" | "VIOLATION";
  message: string;
  cctvId?: string;
}

export interface Fine {
  id: string;
  timestamp: Date;
  plate: string;
  intersection: string;
  amount: number;
  reason: string;
}

export interface EmergencyState {
  id: string;
  cctvId: string;
  intersectionId: string;
  cctvName: string;
  confidence: number;
  route: string[];
  eta: number;
  initialEta: number;
  signalsCleared: number;
  status: "ACTIVE" | "ARRIVED";
}
