import { AnimatePresence, motion } from "framer-motion";
import { useSimulation } from "./hooks/useSimulation";
import { TopBar } from "./components/TopBar";
import { LeftPanel } from "./components/LeftPanel";
import { RightPanel } from "./components/RightPanel";
import { CCTVPanel, PriorityPanel } from "./components/CCTVPanel";
import { CCTVCanvas } from "./components/CCTVCanvas";
import { CCTV } from "./types";

const STATUS_COLORS: Record<string, string> = {
  NORMAL: "#00ff88",
  HIGH_TRAFFIC: "#ffaa00",
  EMERGENCY: "#ff2244",
};

function FocusedView({ cctv, onClose }: { cctv: CCTV; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="h-full flex flex-col items-center justify-center gap-3"
    >
      <div className="flex items-center justify-between w-full px-3">
        <div>
          <div className="text-[9px] font-mono text-gray-500 tracking-widest">FOCUSED FEED</div>
          <div className="text-base font-mono font-black text-cyan-400">
            CAM-{cctv.id} — {cctv.name}
          </div>
          <div className="text-[8px] font-mono text-gray-500 mt-0.5">
            {cctv.vehicleCount} vehicles •{" "}
            <span style={{ color: STATUS_COLORS[cctv.status] }}>{cctv.status.replace("_", " ")}</span>
            {cctv.isSignalFault && <span className="text-yellow-400 ml-1">· ⚠ SIGNAL FAULT</span>}
            {cctv.isCameraGlitch && <span className="text-orange-400 ml-1">· FEED INTERRUPTED</span>}
          </div>
        </div>
        <motion.button
          onClick={onClose}
          className="text-[9px] font-mono px-2 py-0.5 rounded border"
          style={{ borderColor: "#2a3a4a", color: "#888" }}
          whileHover={{ color: "#00e5ff", borderColor: "#00e5ff" }}
          whileTap={{ scale: 0.95 }}
        >
          ✕ CLOSE
        </motion.button>
      </div>

      <div
        className="rounded overflow-hidden w-full flex-1 max-h-80"
        style={{
          border: `2px solid ${STATUS_COLORS[cctv.status]}`,
          boxShadow: `0 0 30px ${STATUS_COLORS[cctv.status]}33`,
        }}
      >
        <CCTVCanvas
          status={cctv.status}
          vehicleCount={cctv.vehicleCount}
          ambulanceDetected={cctv.ambulanceDetected}
          isSignalFault={cctv.isSignalFault}
          isCameraGlitch={cctv.isCameraGlitch}
          cctvId={cctv.id}
        />
      </div>

      <div className="flex items-center gap-4 text-[8px] font-mono text-gray-500">
        <span>Signal: <span style={{ color: cctv.signalColor === "green" ? "#00ff88" : cctv.signalColor === "yellow" ? "#ffaa00" : "#ff2244" }}>{cctv.signalColor.toUpperCase()}</span></span>
        {cctv.confidence && <span>AI Conf: <span className="text-green-400">{(cctv.confidence * 100).toFixed(0)}%</span></span>}
        {cctv.eta && cctv.eta > 0 && <span>ETA: <span className="text-red-400">{cctv.eta}s</span></span>}
        {cctv.route.length > 0 && <span>Route: <span className="text-cyan-400">{cctv.route.join(" → ")}</span></span>}
      </div>
    </motion.div>
  );
}

export default function App() {
  const {
    cctvs,
    eventLog,
    fineLog,
    emergencies,
    emergencyCount,
    rushHour,
    focusedCCTV,
    setFocusedCCTV,
    triggerEmergency,
    triggerRushHour,
    reset,
    activeRoute,
    ambulanceProgress,
  } = useSimulation();

  const activeEmergency = emergencies.find((e) => e.status === "ACTIVE");
  const priorityCCTV = activeEmergency
    ? cctvs.find((c) => c.id === activeEmergency.cctvId)
    : null;
  const focusedCCTVData = focusedCCTV ? cctvs.find((c) => c.id === focusedCCTV) : null;
  const otherCCTVs = priorityCCTV
    ? cctvs.filter((c) => c.id !== priorityCCTV.id)
    : cctvs;

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{ background: "#050a12", cursor: "crosshair", fontFamily: "monospace" }}
    >
      <TopBar
        cctvActiveCount={cctvs.length}
        emergencyCount={emergencyCount}
        onTriggerEmergency={() => triggerEmergency()}
        onRushHour={triggerRushHour}
        onReset={reset}
        rushHour={rushHour}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <LeftPanel
          cctvs={cctvs}
          emergencyCount={emergencyCount}
          onSelectCCTV={(id) => setFocusedCCTV(focusedCCTV === id ? null : id)}
          focusedId={focusedCCTV}
          activeRoute={activeRoute}
          ambulanceProgress={ambulanceProgress}
        />

        <div className="flex-1 min-w-0 p-1.5 overflow-hidden">
          <AnimatePresence mode="wait">
            {focusedCCTVData ? (
              <FocusedView
                key="focused"
                cctv={focusedCCTVData}
                onClose={() => setFocusedCCTV(null)}
              />
            ) : priorityCCTV && activeEmergency ? (
              // Emergency layout: priority panel (left large) + mini grid (right)
              <motion.div
                key="emergency-layout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-1.5 h-full"
              >
                {/* Priority panel — 55% width */}
                <motion.div
                  className="h-full"
                  style={{ flex: "0 0 55%" }}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 180, damping: 22 }}
                >
                  <PriorityPanel
                    cctv={priorityCCTV}
                    eta={activeEmergency.eta}
                    initialEta={activeEmergency.initialEta}
                    route={activeEmergency.route}
                    confidence={activeEmergency.confidence}
                    signalsCleared={activeEmergency.signalsCleared}
                  />
                </motion.div>

                {/* Remaining 8 CCTVs in 2×4 mini grid — 45% width */}
                <div
                  className="grid gap-1 h-full flex-1"
                  style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "repeat(4, 1fr)" }}
                >
                  {otherCCTVs.map((cctv) => {
                    const isCorridorMember = activeEmergency.route.slice(1).includes(cctv.id);
                    const isDimmed = !isCorridorMember && cctv.status !== "EMERGENCY";
                    return (
                      <CCTVPanel
                        key={cctv.id}
                        cctv={cctv}
                        isPriority={false}
                        isDimmed={isDimmed}
                        onClick={() => setFocusedCCTV(focusedCCTV === cctv.id ? null : cctv.id)}
                        focused={focusedCCTV === cctv.id}
                        compact
                      />
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              // Normal 3×3 grid
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-1.5 h-full"
                style={{
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gridTemplateRows: "repeat(3, 1fr)",
                }}
              >
                {cctvs.map((cctv) => (
                  <CCTVPanel
                    key={cctv.id}
                    cctv={cctv}
                    isPriority={false}
                    isDimmed={false}
                    onClick={() => setFocusedCCTV(focusedCCTV === cctv.id ? null : cctv.id)}
                    focused={focusedCCTV === cctv.id}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <RightPanel emergencies={emergencies} events={eventLog} fines={fineLog} />
      </div>
    </div>
  );
}
