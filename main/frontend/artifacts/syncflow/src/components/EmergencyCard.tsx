import { motion, AnimatePresence } from "framer-motion";
import { EmergencyState } from "../types";
import { CCTV_LOCATIONS } from "../simulation";

interface EmergencyCardProps {
  emergency: EmergencyState;
}

function getLocName(id: string) {
  return CCTV_LOCATIONS.find((l) => l.id === id)?.name || id;
}

export function EmergencyCard({ emergency }: EmergencyCardProps) {
  const progress = emergency.status === "ARRIVED"
    ? 100
    : Math.round(((emergency.initialEta - emergency.eta) / emergency.initialEta) * 100);

  const isArrived = emergency.status === "ARRIVED";

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="rounded p-2 mb-2"
      style={{
        background: isArrived
          ? "linear-gradient(135deg, #002a00 0%, #001a00 100%)"
          : "linear-gradient(135deg, #1a0000 0%, #0a0000 100%)",
        border: `1px solid ${isArrived ? "#00aa44" : "#ff2244"}`,
        boxShadow: isArrived ? "0 0 8px #00aa4422" : "0 0 12px #ff224422",
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <motion.span
            className="text-sm"
            animate={!isArrived ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          >
            🚑
          </motion.span>
          <div>
            <div className="text-[10px] font-mono font-bold text-red-300">
              {isArrived ? "✅ ARRIVED" : "EMERGENCY ACTIVE"}
            </div>
            <div className="text-[9px] font-mono text-gray-400">{emergency.cctvName}</div>
          </div>
        </div>
        <div className="text-right">
          {!isArrived ? (
            <motion.div
              className="text-lg font-mono font-black text-red-400"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              {emergency.eta}s
            </motion.div>
          ) : (
            <div className="text-xs font-mono font-bold text-green-400">HOSPITAL</div>
          )}
          <div className="text-[9px] font-mono text-gray-500">ETA</div>
        </div>
      </div>

      <div className="mb-1.5">
        <div className="flex justify-between text-[8px] font-mono text-gray-500 mb-0.5">
          <span>ROUTE PROGRESS</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isArrived
                ? "linear-gradient(90deg, #00aa44, #00ff88)"
                : "linear-gradient(90deg, #ff2244, #ff6622)",
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 mb-1.5 flex-wrap">
        {emergency.route.map((id, i) => (
          <div key={id} className="flex items-center gap-1">
            <span
              className="text-[8px] font-mono px-1 py-0.5 rounded"
              style={{
                background: i === 0 ? "#ff224433" : "#00224433",
                color: i === 0 ? "#ff7788" : "#00aaff",
                border: `1px solid ${i === 0 ? "#ff2244" : "#004488"}`,
              }}
            >
              {id}
            </span>
            {i < emergency.route.length - 1 && (
              <span className="text-[8px] text-gray-600">→</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[8px] font-mono text-gray-500">
        <span>
          Confidence:{" "}
          <span className="text-green-400 font-bold">
            {(emergency.confidence * 100).toFixed(0)}%
          </span>
        </span>
        <span>
          Signals cleared:{" "}
          <span className="text-yellow-400 font-bold">{emergency.signalsCleared}</span>
        </span>
      </div>
    </motion.div>
  );
}
