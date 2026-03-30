import { motion, AnimatePresence } from "framer-motion";
import { Fine } from "../types";

interface FineLogProps {
  fines: Fine[];
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-IN", { hour12: false });
}

export function FineLog({ fines }: FineLogProps) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="text-[9px] font-mono font-bold tracking-widest px-2 py-1.5 border-b flex items-center gap-2 shrink-0"
        style={{ color: "#ffaa00", borderColor: "#1a2a3a", background: "rgba(20,15,0,0.8)" }}
      >
        💰 AUTO-FINE LOG
        <span className="ml-auto text-gray-600">{fines.length}</span>
      </div>
      <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#ffaa0020 transparent" }}>
        <AnimatePresence initial={false}>
          {fines.map((fine) => (
            <motion.div
              key={fine.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="px-2 py-1.5 border-b"
              style={{ borderColor: "#0a1520" }}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className="text-[9px] font-mono font-bold tracking-wider px-1 rounded"
                  style={{ background: "#1a0800", color: "#ffcc44", border: "1px solid #663300" }}
                >
                  {fine.plate}
                </span>
                <span className="text-[9px] font-mono font-bold text-orange-400">
                  ₹{fine.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="text-[7px] font-mono text-gray-600 mb-0.5 truncate">{fine.reason}</div>
              <div className="flex items-center justify-between">
                <span className="text-[7px] font-mono text-gray-500">{fine.intersection}</span>
                <span className="text-[7px] font-mono text-gray-700">{formatTime(fine.timestamp)}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {fines.length === 0 && (
          <div className="text-[9px] font-mono text-gray-600 text-center py-4">No fines issued</div>
        )}
      </div>
    </div>
  );
}
