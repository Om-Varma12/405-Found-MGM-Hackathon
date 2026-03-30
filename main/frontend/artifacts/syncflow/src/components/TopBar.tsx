import { motion } from "framer-motion";

interface TopBarProps {
  cctvActiveCount: number;
  emergencyCount: number;
  onTriggerEmergency: () => void;
  onRushHour: () => void;
  onReset: () => void;
  rushHour: boolean;
}

export function TopBar({
  cctvActiveCount,
  emergencyCount,
  onTriggerEmergency,
  onRushHour,
  onReset,
  rushHour,
}: TopBarProps) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2 border-b shrink-0"
      style={{
        background: "linear-gradient(90deg, #0a0f1a 0%, #0d1525 100%)",
        borderColor: "#1a2a3a",
        height: "48px",
      }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-xs font-black"
            style={{ background: "linear-gradient(135deg, #00e5ff, #0088ff)", color: "#000" }}
          >
            S
          </div>
          <span
            className="text-sm font-black tracking-widest"
            style={{ color: "#00e5ff", fontFamily: "monospace", letterSpacing: "0.2em" }}
          >
            SYNCFLOW
          </span>
        </motion.div>
        <div className="text-[9px] font-mono text-gray-600 hidden sm:block">
          TRAFFIC AI CONTROL CENTER v2.1
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusPill color="#00ff88" label="AI SYSTEM" value="ONLINE" icon="✅" />
        <StatusPill
          color="#00aaff"
          label="CCTV NETWORK"
          value={`${cctvActiveCount}/9 ACTIVE`}
          icon="📡"
        />
        <StatusPill
          color={emergencyCount > 0 ? "#ff2244" : "#666"}
          label="EMERGENCIES"
          value={String(emergencyCount)}
          icon="🚨"
          pulse={emergencyCount > 0}
        />
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          onClick={onTriggerEmergency}
          className="text-[10px] font-mono font-bold px-3 py-1 rounded tracking-wider"
          style={{
            background: "linear-gradient(90deg, #7f0000, #cc0000)",
            color: "#fff",
            border: "1px solid #ff2244",
            boxShadow: "0 0 10px #ff224455, 0 0 3px #ff2244",
          }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 18px #ff2244aa, 0 0 5px #ff2244" }}
          whileTap={{ scale: 0.95 }}
        >
          🚑 TRIGGER EMERGENCY
        </motion.button>
        <motion.button
          onClick={onRushHour}
          disabled={rushHour}
          className="text-[10px] font-mono font-bold px-3 py-1 rounded tracking-wider"
          style={{
            background: rushHour
              ? "rgba(100,70,0,0.5)"
              : "linear-gradient(90deg, #5a3e00, #a06800)",
            color: rushHour ? "#666" : "#ffcc00",
            border: `1px solid ${rushHour ? "#555" : "#ffaa00"}`,
            boxShadow: rushHour ? "none" : "0 0 8px #ffaa0033",
            cursor: rushHour ? "not-allowed" : "pointer",
          }}
          whileHover={!rushHour ? { scale: 1.05 } : {}}
          whileTap={!rushHour ? { scale: 0.95 } : {}}
        >
          🌆 RUSH HOUR
        </motion.button>
        <motion.button
          onClick={onReset}
          className="text-[10px] font-mono font-bold px-3 py-1 rounded tracking-wider"
          style={{
            background: "rgba(0,40,60,0.8)",
            color: "#00e5ff",
            border: "1px solid #004466",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔄 RESET
        </motion.button>
      </div>
    </div>
  );
}

interface StatusPillProps {
  color: string;
  label: string;
  value: string;
  icon: string;
  pulse?: boolean;
}

function StatusPill({ color, label, value, icon, pulse }: StatusPillProps) {
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-mono"
      style={{
        background: "rgba(0,0,0,0.4)",
        border: `1px solid ${color}33`,
      }}
    >
      <motion.div
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: color }}
        animate={pulse ? { opacity: [1, 0.2, 1], scale: [1, 1.4, 1] } : { opacity: 1 }}
        transition={{ repeat: Infinity, duration: 0.8 }}
      />
      <span className="text-gray-500">{icon}</span>
      <span style={{ color: "#aaa" }}>{label}:</span>
      <span style={{ color }} className="font-bold">
        {value}
      </span>
    </div>
  );
}
