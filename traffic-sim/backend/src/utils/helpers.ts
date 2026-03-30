import type { EventLog, EventType } from "../models/EventLog";

let logIdCounter = 0;

export function createEventLog(
  event: EventType,
  message: string,
  data?: Record<string, unknown>
): EventLog {
  return {
    id: `log-${Date.now()}-${++logIdCounter}`,
    timestamp: new Date(),
    event,
    message,
    data,
  };
}

export function generateId(prefix = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
