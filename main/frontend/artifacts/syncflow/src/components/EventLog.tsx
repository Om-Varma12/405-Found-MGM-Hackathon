import { motion, AnimatePresence } from "framer-motion";
import { EventLog } from "../types";

interface EventLogProps {
  events: EventLog[];
}

const TYPE_COLORS: Record<EventLog["type"], string> = {
  NORMAL: "#00ff88",
  HIGH_TRAFFIC: "#ffaa00",
  EMERGENCY: "#ff2244",
  ARRIVED: "#00ff88",
  FINE: "#ff8800",
  RESET: "#00aaff",
  RUSH_HOUR: "#ffaa00",
};

const TYPE_ICONS: Record<EventLog["type"], string> = {
  NORMAL: "●",
  HIGH_TRAFFIC: "▲",
  EMERGENCY: "🚨",
  ARRIVED: "✅",
  FINE: "💰",
  RESET: "🔄",
  RUSH_HOUR: "⚠️",
};

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-IN", { hour12: false });
}

export function EventLogPanel({ events }: EventLogProps) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="text-[9px] font-mono font-bold tracking-widest px-2 py-1.5 border-b flex items-center gap-2"
        style={{ color: "#00e5ff", borderColor: "#1a2a3a", background: "rgba(0,20,30,0.8)" }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-green-400"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
        SYSTEM EVENT LOG
        <span className="ml-auto text-gray-600">{events.length}</span>
      </div>
      <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#00e5ff20 transparent" }}>
        <AnimatePresence initial={false}>
          {events.map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="px-2 py-1.5 border-b flex items-start gap-1.5"
              style={{ borderColor: "#0a1520" }}
            >
              <span
                className="text-[10px] shrink-0 mt-0.5"
                style={{ color: TYPE_COLORS[ev.type] }}
              >
                {TYPE_ICONS[ev.type]}
              </span>
              <div className="min-w-0">
                <div className="text-[8px] font-mono text-gray-500 mb-0.5">
                  {formatTime(ev.timestamp)}
                  {ev.cctvId && (
                    <span className="ml-1 text-cyan-600">[{ev.cctvId}]</span>
                  )}
                </div>
                <div
                  className="text-[9px] font-mono leading-tight break-words"
                  style={{ color: ev.type === "EMERGENCY" ? "#ff9999" : ev.type === "ARRIVED" ? "#99ffbb" : "#c0ccd8" }}
                >
                  {ev.message}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {events.length === 0 && (
          <div className="text-[9px] font-mono text-gray-600 text-center py-4">
            No events yet
          </div>
        )}
      </div>
    </div>
  );
}
