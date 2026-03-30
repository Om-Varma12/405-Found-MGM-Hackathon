export type EventType =
  | "SIMULATION_START"
  | "SIMULATION_END"
  | "ROUTE_SELECTED"
  | "CCTV_ACTIVATED"
  | "VIOLATION_DETECTED"
  | "AMBULANCE_DISPATCHED"
  | "HOSPITAL_ALERTED"
  | "ROUTE_ERROR";

export interface EventLog {
  id: string;
  timestamp: Date;
  event: EventType;
  message: string;
  data?: Record<string, unknown>;
}
