import { AnimatePresence } from "framer-motion";
import { EmergencyState, EventLog, Fine } from "../types";
import { EmergencyCard } from "./EmergencyCard";
import { EventLogPanel } from "./EventLog";
import { FineLog } from "./FineLog";

interface RightPanelProps {
  emergencies: EmergencyState[];
  events: EventLog[];
  fines: Fine[];
}

export function RightPanel({ emergencies, events, fines }: RightPanelProps) {
  return (
    <div
      className="flex flex-col border-l h-full overflow-hidden"
      style={{ borderColor: "#1a2a3a", background: "rgba(5,10,18,0.98)", width: "220px", minWidth: "220px" }}
    >
      {emergencies.length > 0 && (
        <div className="border-b px-2 py-1.5" style={{ borderColor: "#1a2a3a" }}>
          <div
            className="text-[8px] font-mono font-bold tracking-widest mb-1.5"
            style={{ color: "#ff4466" }}
          >
            🚨 ACTIVE EMERGENCIES ({emergencies.length})
          </div>
          <AnimatePresence>
            {emergencies.map((em) => (
              <EmergencyCard key={em.id} emergency={em} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <div
        className="flex-1 overflow-hidden flex flex-col"
        style={{ minHeight: 0, maxHeight: emergencies.length > 0 ? "45%" : "65%" }}
      >
        <EventLogPanel events={events} />
      </div>

      <div
        className="border-t overflow-hidden flex flex-col"
        style={{ borderColor: "#1a2a3a", height: "35%", minHeight: "120px" }}
      >
        <FineLog fines={fines} />
      </div>
    </div>
  );
}
