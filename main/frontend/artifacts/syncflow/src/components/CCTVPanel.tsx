import { motion, AnimatePresence } from "framer-motion";
import { CCTV } from "../types";
import { CCTVCanvas } from "./CCTVCanvas";
import { ARM_LABEL } from "../simulation";

interface CCTVPanelProps {
  cctv: CCTV;
  onClick: () => void;
  focused: boolean;
}

export function CCTVPanel({ cctv, onClick, focused }: CCTVPanelProps) {
  const isEmergency = cctv.status === "EMERGENCY";
  const isCorridor = cctv.isCorridorActive;
  const isHigh = cctv.status === "HIGH_TRAFFIC";

  let borderColor = "rgba(0,255,136,0.25)";
  let boxShadow = "none";

  if (isEmergency) {
    borderColor = "#ff2d55";
    boxShadow = "0 0 0 2px #ff2d55, 0 0 18px #ff2d5580";
  } else if (isCorridor) {
    borderColor = "#ffcc00";
    boxShadow = "0 0 0 1.5px #ffcc00, 0 0 10px #ffcc0060";
  } else if (isHigh) {
    borderColor = "rgba(255,160,0,0.45)";
  }

  return (
    <div
      className="relative rounded overflow-hidden cursor-crosshair group h-full w-full"
      style={{
        border: `1.5px solid ${borderColor}`,
        boxShadow: isEmergency
          ? "0 0 0 2px #ff2d55, 0 0 20px #ff2d5580"
          : isCorridor
          ? "0 0 0 1.5px #ffcc00, 0 0 12px #ffcc0060"
          : "none",
        animation: isEmergency ? "emergencyPulse 1s ease-in-out infinite" : undefined,
      }}
      onClick={onClick}
    >
      {/* Canvas feed */}
      <div className="absolute inset-0">
        <CCTVCanvas
          status={cctv.status}
          vehicleCount={cctv.vehicleCount}
          ambulanceDetected={cctv.ambulanceDetected}
          isSignalFault={cctv.isSignalFault}
          isCameraGlitch={cctv.isCameraGlitch}
          cctvId={cctv.id}
          direction={cctv.direction}
          signalColor={cctv.signalColor}
        />
      </div>

      {/* Emergency red tint overlay */}
      {isEmergency && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(255,45,85,0.08)", zIndex: 5 }} />
      )}

      {/* PRIORITY badge */}
      <AnimatePresence>
        {isEmergency && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-10 flex justify-center py-0.5"
            style={{ background: "rgba(180,0,28,0.88)" }}
          >
            <motion.span
              className="text-[8px] font-mono font-black text-white tracking-widest"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 0.7 }}
            >
              🚨 PRIORITY
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORRIDOR badge */}
      <AnimatePresence>
        {isCorridor && !isEmergency && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-10 flex justify-center py-0.5"
            style={{ background: "rgba(120,80,0,0.85)" }}
          >
            <motion.span
              className="text-[7px] font-mono font-bold tracking-widest"
              style={{ color: "#ffcc44" }}
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              ⚡ CORRIDOR
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIGNAL FAULT badge */}
      {cctv.isSignalFault && (
        <motion.div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 px-1.5 py-0.5 rounded"
          style={{ background: "rgba(160,90,0,0.85)", border: "1px solid #ffaa00" }}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 0.9 }}
        >
          <span className="text-[7px] font-mono font-bold text-yellow-300">⚠ FAULT</span>
        </motion.div>
      )}

      {/* ETA badge */}
      {isEmergency && cctv.eta !== null && cctv.eta > 0 && (
        <motion.div
          className="absolute bottom-1 right-1 z-10 text-[7px] font-mono font-black px-1 py-0.5 rounded"
          style={{ background: "rgba(180,0,28,0.88)", color: "#fff" }}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        >
          {cctv.eta}s
        </motion.div>
      )}

      {/* Direction pill (bottom-left corner, above timestamp) */}
      <div className="absolute bottom-4 left-1 z-10">
        <span className="text-[6px] font-mono" style={{ color: "rgba(0,200,255,0.6)" }}>
          {ARM_LABEL[cctv.direction]}
        </span>
      </div>

      {/* Hover: click to focus */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150"
        style={{ background: "rgba(0,0,0,0.36)" }}
      >
        <span className="text-[8px] font-mono font-bold border border-cyan-400 px-1.5 py-0.5 text-cyan-300 tracking-widest">
          {focused ? "FOCUSED" : "CLICK TO FOCUS"}
        </span>
      </div>
    </div>
  );
}
