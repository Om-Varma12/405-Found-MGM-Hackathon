import { useState, useEffect, useRef, useCallback } from "react";
import { CCTV, EmergencyState, EventLog, Fine } from "../types";
import {
  createInitialCCTVs,
  generateRoute,
  generatePlate,
  generateEmergencyId,
  createEventLog,
  generateFineId,
  INTERSECTIONS,
  DIRECTIONS,
} from "../simulation";

export function useSimulation() {
  const [cctvs, setCctvs] = useState<CCTV[]>(createInitialCCTVs);
  const [eventLog, setEventLog] = useState<EventLog[]>([]);
  const [fineLog, setFineLog] = useState<Fine[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyState[]>([]);
  const [emergencyCount, setEmergencyCount] = useState(0);
  const [rushHour, setRushHour] = useState(false);
  const [focusedCCTV, setFocusedCCTV] = useState<string | null>(null);

  const rushHourRef = useRef(rushHour);
  const cctvRef = useRef(cctvs);
  const emergenciesRef = useRef(emergencies);
  rushHourRef.current = rushHour;
  cctvRef.current = cctvs;
  emergenciesRef.current = emergencies;

  const addEvent = useCallback((type: EventLog["type"], message: string, cctvId?: string) => {
    setEventLog(prev => [createEventLog(type, message, cctvId), ...prev].slice(0, 120));
  }, []);

  const addFine = useCallback((intersection: string, reason = "Emergency corridor block", amount?: number) => {
    const fine: Fine = {
      id: generateFineId(),
      timestamp: new Date(),
      plate: generatePlate(),
      intersection,
      amount: amount ?? Math.floor(Math.random() * 2000) + 800,
      reason,
    };
    setFineLog(prev => [fine, ...prev].slice(0, 60));
    addEvent("FINE", `💰 ${fine.plate} @ ${intersection} — ₹${fine.amount} (${reason})`);
  }, [addEvent]);

  const triggerEmergency = useCallback((forceCctvId?: string) => {
    // Pick a random CCTV to detect the ambulance
    const allCctvs = cctvRef.current;
    const eligible = allCctvs.filter(c => c.status !== "EMERGENCY");
    if (eligible.length === 0) return;

    const targetCctv = forceCctvId
      ? allCctvs.find(c => c.id === forceCctvId) || eligible[Math.floor(Math.random() * eligible.length)]
      : eligible[Math.floor(Math.random() * eligible.length)];

    const intId = targetCctv.intersectionId;
    const confidence = parseFloat((Math.random() * 0.06 + 0.91).toFixed(2));
    // Route = list of intersection IDs (not camera IDs)
    const route = generateRoute(intId);
    const eta = Math.floor(Math.random() * 91) + 90;
    const signalsCleared = route.length - 1;
    const emergencyId = generateEmergencyId();

    const emergency: EmergencyState = {
      id: emergencyId,
      cctvId: targetCctv.id,
      intersectionId: intId,
      cctvName: targetCctv.name,
      confidence,
      route,
      eta,
      initialEta: eta,
      signalsCleared,
      status: "ACTIVE",
    };

    setEmergencies(prev => [...prev, emergency]);
    setEmergencyCount(c => c + 1);

    setCctvs(prev => prev.map(c => {
      if (c.id === targetCctv.id) {
        return { ...c, status: "EMERGENCY", ambulanceDetected: true, confidence, route, eta, vehicleCount: Math.floor(Math.random() * 6) + 8, signalColor: "red", isCorridorActive: false };
      }
      // All cameras of corridor intersections (except origin)
      if (route.slice(1).includes(c.intersectionId)) {
        return { ...c, isCorridorActive: true, signalColor: "green" };
      }
      return c;
    }));

    // Staged event burst
    const intName = INTERSECTIONS.find(i => i.id === intId)?.name || intId;
    const events: [EventLog["type"], string, string | undefined][] = [
      ["EMERGENCY", `🔴 CAM-${targetCctv.id} → AMBULANCE DETECTED (conf: ${(confidence*100).toFixed(0)}%)`, targetCctv.id],
      ["EMERGENCY", `🔴 PRIORITY → ${intName} (${intId})`, targetCctv.id],
    ];
    route.slice(1).forEach(rid => {
      const rname = INTERSECTIONS.find(i => i.id === rid)?.name || rid;
      events.push(["HIGH_TRAFFIC", `🟡 ${rid} → Corridor standby (${rname})`, undefined]);
      DIRECTIONS.forEach(d => events.push(["NORMAL", `🟢 CAM-${rid}-${d} → Signal forced GREEN`, `${rid}-${d}`]));
    });
    events.push(["EMERGENCY", `🔴 Route: ${route.join("→")}→HOSPITAL`, targetCctv.id]);
    events.push(["ARRIVED", `📍 ETA: ${Math.floor(eta/60)}m ${eta%60}s`, targetCctv.id]);

    events.forEach(([type, msg, cid], i) => setTimeout(() => addEvent(type, msg, cid), i * 220));
  }, [addEvent]);

  const triggerRushHour = useCallback(() => {
    if (rushHourRef.current) return;
    setRushHour(true);
    setCctvs(prev => prev.map(c =>
      c.status === "NORMAL" ? { ...c, status: "HIGH_TRAFFIC", vehicleCount: Math.floor(Math.random() * 6) + 10, signalColor: "yellow" } : c
    ));
    addEvent("RUSH_HOUR", "⚠️ RUSH HOUR — All intersections at high density");
    setTimeout(() => {
      setRushHour(false);
      setCctvs(prev => prev.map(c =>
        c.status === "HIGH_TRAFFIC" ? { ...c, status: "NORMAL", vehicleCount: Math.floor(Math.random() * 4) + 3, signalColor: "green" } : c
      ));
      addEvent("NORMAL", "Rush hour ended — traffic normalizing");
    }, 30000);
  }, [addEvent]);

  const reset = useCallback(() => {
    setCctvs(createInitialCCTVs());
    setEmergencies([]);
    setFineLog([]);
    setRushHour(false);
    setFocusedCCTV(null);
    addEvent("RESET", "🔄 System reset — all corridors cleared");
  }, [addEvent]);

  // ETA countdown
  useEffect(() => {
    const iv = setInterval(() => {
      setEmergencies(prev => prev.map(em => {
        if (em.status !== "ACTIVE") return em;
        const newEta = em.eta - 1;
        if (newEta <= 0) {
          setTimeout(() => {
            addEvent("ARRIVED", `✅ AMBULANCE ARRIVED — Hospital via ${em.cctvName}`, em.cctvId);
            addEvent("ARRIVED", "✅ Green corridor released — signals returning to normal");
            setCctvs(prev2 => prev2.map(c => {
              if (c.id === em.cctvId) return { ...c, status: "NORMAL", ambulanceDetected: false, confidence: null, route: [], eta: null, vehicleCount: Math.floor(Math.random() * 4) + 3, signalColor: "green", isCorridorActive: false };
              if (em.route.slice(1).includes(c.intersectionId)) return { ...c, isCorridorActive: false };
              return c;
            }));
            setEmergencies(prev3 => prev3.filter(e => e.id !== em.id));
          }, 10000);
          return { ...em, eta: 0, status: "ARRIVED" as const };
        }
        return { ...em, eta: newEta };
      }));

      // Sync CCTV eta display
      setCctvs(prev => prev.map(c => {
        const em = emergenciesRef.current.find(e => e.cctvId === c.id && e.status === "ACTIVE");
        if (em) return { ...c, eta: Math.max(0, em.eta - 1) };
        return c;
      }));
    }, 1000);
    return () => clearInterval(iv);
  }, [addEvent]);

  // Auto fines during emergency
  useEffect(() => {
    const iv = setInterval(() => {
      emergenciesRef.current.filter(e => e.status === "ACTIVE").forEach(em => {
        if (Math.random() < 0.4) {
          const rid = em.route[Math.floor(Math.random() * em.route.length)];
          const rname = INTERSECTIONS.find(i => i.id === rid)?.name || rid;
          addFine(rname, "Emergency corridor block");
        }
      });
    }, 15000);
    return () => clearInterval(iv);
  }, [addFine]);

  // Random high-traffic events
  useEffect(() => {
    const schedule = (): ReturnType<typeof setTimeout> => setTimeout(() => {
      if (!rushHourRef.current) {
        const normal = cctvRef.current.filter(c => c.status === "NORMAL" && !c.isCorridorActive);
        if (normal.length > 0) {
          const t = normal[Math.floor(Math.random() * normal.length)];
          const vc = Math.floor(Math.random() * 6) + 10;
          setCctvs(prev => prev.map(c => c.id === t.id ? { ...c, status: "HIGH_TRAFFIC", vehicleCount: vc, signalColor: "yellow" } : c));
          addEvent("HIGH_TRAFFIC", `🟡 CAM-${t.id} → Density exceeded (${vc} vehicles)`, t.id);
          setTimeout(() => {
            setCctvs(prev => prev.map(c => c.id === t.id && c.status === "HIGH_TRAFFIC" ? { ...c, status: "NORMAL", vehicleCount: Math.floor(Math.random() * 4) + 3, signalColor: "green" } : c));
            addEvent("NORMAL", `CAM-${t.id} → Traffic normalized`, t.id);
          }, 15000);
        }
      }
      schedule();
    }, Math.floor(Math.random() * 20000) + 20000);
    const t = schedule();
    return () => clearTimeout(t);
  }, [addEvent]);

  // Auto emergency every 45–90s
  useEffect(() => {
    const schedule = (): ReturnType<typeof setTimeout> => setTimeout(() => {
      triggerEmergency();
      schedule();
    }, Math.floor(Math.random() * 45000) + 45000);
    const t = schedule();
    return () => clearTimeout(t);
  }, [triggerEmergency]);

  // Random signal faults, glitches, violations
  useEffect(() => {
    const schedule = (): ReturnType<typeof setTimeout> => setTimeout(() => {
      const candidates = cctvRef.current.filter(c => c.status !== "EMERGENCY" && !c.isCorridorActive);
      if (candidates.length > 0) {
        const t = candidates[Math.floor(Math.random() * candidates.length)];
        const roll = Math.random();
        if (roll < 0.28) {
          // Signal fault
          setCctvs(prev => prev.map(c => c.id === t.id ? { ...c, isSignalFault: true, signalColor: "red" } : c));
          addEvent("SIGNAL_FAULT", `⚠ CAM-${t.id} → Signal fault at ${t.intersectionName}`, t.id);
          setTimeout(() => {
            setCctvs(prev => prev.map(c => c.id === t.id ? { ...c, isSignalFault: false, signalColor: "green" } : c));
            addEvent("NORMAL", `✅ CAM-${t.id} → Signal restored`, t.id);
          }, 10000);
        } else if (roll < 0.55) {
          // Camera glitch
          setCctvs(prev => prev.map(c => c.id === t.id ? { ...c, isCameraGlitch: true } : c));
          addEvent("GLITCH", `⚠ CAM-${t.id} → Feed interrupted`, t.id);
          setTimeout(() => {
            setCctvs(prev => prev.map(c => c.id === t.id ? { ...c, isCameraGlitch: false } : c));
            addEvent("NORMAL", `✅ CAM-${t.id} → Feed recovered`, t.id);
          }, 2500);
        } else {
          // Red light violation
          addEvent("VIOLATION", `🔴 CAM-${t.id} → Red light violation: ${generatePlate()}`, t.id);
          addFine(t.intersectionName, "Red light violation", 1000);
        }
      }
      schedule();
    }, Math.floor(Math.random() * 15000) + 25000);
    const t = schedule();
    return () => clearTimeout(t);
  }, [addEvent, addFine]);

  // Ambulance progress for minimap
  const activeEmergency = emergencies.find(e => e.status === "ACTIVE");
  const ambulanceProgress = activeEmergency ? 1 - activeEmergency.eta / activeEmergency.initialEta : 0;
  const activeRoute = activeEmergency ? activeEmergency.route : [];

  return {
    cctvs, eventLog, fineLog, emergencies, emergencyCount, rushHour,
    focusedCCTV, setFocusedCCTV, triggerEmergency, triggerRushHour,
    reset, activeRoute, ambulanceProgress,
  };
}
