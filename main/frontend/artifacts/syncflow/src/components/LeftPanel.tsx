import { motion } from "framer-motion";
import { CCTV } from "../types";
import { MiniMap } from "./MiniMap";

interface LeftPanelProps {
  cctvs: CCTV[];
  emergencyCount: number;
  onSelectCCTV: (id: string) => void;
  focusedId: string | null;
  activeRoute: string[];
  ambulanceProgress: number;
}

const STATUS_COLORS = {
  NORMAL: "#00ff88",
  HIGH_TRAFFIC: "#ffaa00",
  EMERGENCY: "#ff2244",
};

export function LeftPanel({ cctvs, emergencyCount, onSelectCCTV, focusedId, activeRoute, ambulanceProgress }: LeftPanelProps) {
  return (
    <div
      className="flex flex-col border-r h-full overflow-hidden"
      style={{ borderColor: "#1a2a3a", background: "rgba(5,10,18,0.98)", width: "158px", minWidth: "158px" }}
    >
      {/* System info */}
      <div className="px-2 py-2 border-b" style={{ borderColor: "#1a2a3a" }}>
        <div className="text-[8px] font-mono text-gray-600 tracking-widest mb-1">SYSTEM INFO</div>
        <div className="space-y-0.5">
          <InfoRow label="MODE" value="AI ACTIVE" color="#00ff88" />
          <InfoRow label="FEEDS" value="9 / 9" color="#00aaff" />
          <InfoRow
            label="ALERTS"
            value={String(emergencyCount)}
            color={emergencyCount > 0 ? "#ff2244" : "#666"}
            pulse={emergencyCount > 0}
          />
          <InfoRow label="VER" value="v2.1.0" color="#555" />
        </div>
      </div>

      {/* CCTV index */}
      <div className="px-2 py-1 border-b text-[8px] font-mono text-gray-600 tracking-widest" style={{ borderColor: "#1a2a3a" }}>
        CCTV INDEX
      </div>
      <div className="overflow-y-auto" style={{ flex: "0 0 auto", maxHeight: "200px", scrollbarWidth: "thin", scrollbarColor: "#00e5ff12 transparent" }}>
        {cctvs.map((cctv) => {
          const dotColor = cctv.status === "EMERGENCY"
            ? "#ff2244"
            : cctv.isCorridorActive
            ? "#ffaa00"
            : STATUS_COLORS[cctv.status];

          return (
            <motion.div
              key={cctv.id}
              className="flex items-center gap-1 px-2 py-0.5 cursor-pointer border-b"
              style={{
                borderColor: "#080f18",
                background: focusedId === cctv.id ? "rgba(0,100,120,0.25)" : "transparent",
              }}
              onClick={() => onSelectCCTV(cctv.id)}
              whileHover={{ background: "rgba(0,80,100,0.18)" }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: dotColor }}
                animate={cctv.status === "EMERGENCY" ? { opacity: [1, 0.2, 1] } : { opacity: 1 }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
              <span className="text-[8px] font-mono text-cyan-500 font-bold">{cctv.id}</span>
              <span className="text-[7px] font-mono text-gray-500 truncate flex-1">{cctv.name}</span>
              {cctv.isSignalFault && <span className="text-[7px] text-yellow-500">⚠</span>}
              {cctv.isCameraGlitch && <span className="text-[7px] text-orange-400">📡</span>}
            </motion.div>
          );
        })}
      </div>

      {/* Minimap */}
      <div className="border-t border-b" style={{ borderColor: "#1a2a3a" }}>
        <MiniMap cctvs={cctvs} activeRoute={activeRoute} ambulanceProgress={ambulanceProgress} />
      </div>

      {/* Emergency counter */}
      <div className="px-2 py-2 mt-auto border-t" style={{ borderColor: "#1a2a3a" }}>
        <div className="text-[8px] font-mono text-gray-600 tracking-widest mb-1">TOTAL EMERGENCIES</div>
        <motion.div
          key={emergencyCount}
          className="text-2xl font-mono font-black text-center"
          initial={{ scale: 1.4, color: "#ff2244" }}
          animate={{ scale: 1, color: emergencyCount > 0 ? "#ff4466" : "#444" }}
          transition={{ duration: 0.4 }}
        >
          {emergencyCount}
        </motion.div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, color, pulse }: { label: string; value: string; color: string; pulse?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[8px] font-mono text-gray-600">{label}</span>
      <motion.span
        className="text-[8px] font-mono font-bold"
        style={{ color }}
        animate={pulse ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
        transition={{ repeat: Infinity, duration: 0.8 }}
      >
        {value}
      </motion.span>
    </div>
  );
}
