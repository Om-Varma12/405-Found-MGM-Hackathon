import { useEffect, useRef } from "react";
import { CCTV } from "../types";

// Approximate layout positions for the 9 CCTVs on a mini-map
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  S1: { x: 0.5, y: 0.07 },
  S2: { x: 0.3, y: 0.28 },
  S3: { x: 0.7, y: 0.28 },
  S4: { x: 0.88, y: 0.5 },
  S5: { x: 0.12, y: 0.5 },
  S6: { x: 0.5, y: 0.5 },
  S7: { x: 0.35, y: 0.68 },
  S8: { x: 0.65, y: 0.68 },
  S9: { x: 0.5, y: 0.88 },
};

// Road connections
const CONNECTIONS: [string, string][] = [
  ["S1", "S2"], ["S1", "S3"], ["S2", "S5"], ["S2", "S6"],
  ["S3", "S4"], ["S3", "S6"], ["S5", "S7"], ["S6", "S7"],
  ["S6", "S8"], ["S4", "S8"], ["S7", "S9"], ["S8", "S9"],
];

const HOSPITAL_POS = { x: 0.82, y: 0.85 };

interface MiniMapProps {
  cctvs: CCTV[];
  activeRoute: string[];
  ambulanceProgress: number; // 0-1
}

export function MiniMap({ cctvs, activeRoute, ambulanceProgress }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      frameRef.current++;
      const f = frameRef.current;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#080e18";
      ctx.fillRect(0, 0, W, H);

      // Draw connection roads
      CONNECTIONS.forEach(([a, b]) => {
        const pa = NODE_POSITIONS[a];
        const pb = NODE_POSITIONS[b];
        if (!pa || !pb) return;

        const isCorridorSegment =
          activeRoute.length > 1 &&
          activeRoute.some((id, i) => {
            if (i === activeRoute.length - 1) return false;
            return (id === a && activeRoute[i + 1] === b) || (id === b && activeRoute[i + 1] === a);
          });

        if (isCorridorSegment) {
          // Pulsing amber corridor
          const pulse = Math.sin(f * 0.15) * 0.4 + 0.6;
          ctx.strokeStyle = `rgba(255,170,0,${pulse * 0.85})`;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 4]);
        } else {
          ctx.strokeStyle = "rgba(60,80,100,0.5)";
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.moveTo(pa.x * W, pa.y * H);
        ctx.lineTo(pb.x * W, pb.y * H);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw hospital
      const hx = HOSPITAL_POS.x * W;
      const hy = HOSPITAL_POS.y * H;
      ctx.fillStyle = "#220000";
      ctx.fillRect(hx - 7, hy - 7, 14, 14);
      ctx.strokeStyle = "#cc2244";
      ctx.lineWidth = 1;
      ctx.strokeRect(hx - 7, hy - 7, 14, 14);
      ctx.fillStyle = "#ff2244";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("✚", hx, hy + 4);
      ctx.fillStyle = "rgba(255,50,50,0.5)";
      ctx.font = "6px monospace";
      ctx.fillText("HOSP", hx, hy + 12);
      ctx.textAlign = "left";

      // Draw CCTV nodes
      cctvs.forEach((cctv) => {
        const pos = NODE_POSITIONS[cctv.id];
        if (!pos) return;
        const nx = pos.x * W;
        const ny = pos.y * H;

        let dotColor = "#00ff88";
        let dotSize = 4;
        let pulse = false;

        if (cctv.status === "EMERGENCY") {
          dotColor = "#ff2244";
          dotSize = 5;
          pulse = true;
        } else if (cctv.isCorridorActive) {
          dotColor = "#ffaa00";
          dotSize = 4;
        } else if (cctv.status === "HIGH_TRAFFIC") {
          dotColor = "#ffaa00";
          dotSize = 4;
        } else if (cctv.isSignalFault) {
          dotColor = "#ff8800";
          dotSize = 4;
        }

        if (pulse) {
          const alpha = Math.sin(f * 0.2) * 0.3 + 0.5;
          ctx.fillStyle = `rgba(255,34,68,${alpha * 0.3})`;
          ctx.beginPath();
          ctx.arc(nx, ny, dotSize + 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(nx, ny, dotSize, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = "rgba(180,190,200,0.7)";
        ctx.font = "6px monospace";
        ctx.fillText(cctv.id, nx + dotSize + 1, ny + 3);
      });

      // Animate ambulance dot along route
      if (activeRoute.length >= 2 && ambulanceProgress > 0) {
        const totalSegments = activeRoute.length - 1;
        const segProgress = ambulanceProgress * totalSegments;
        const segIndex = Math.min(Math.floor(segProgress), totalSegments - 1);
        const segFrac = segProgress - segIndex;

        const fromId = activeRoute[segIndex];
        const toId = activeRoute[segIndex + 1];
        const fromPos = NODE_POSITIONS[fromId];
        const toPos = NODE_POSITIONS[toId] || HOSPITAL_POS;

        if (fromPos && toPos) {
          const ax = (fromPos.x + (toPos.x - fromPos.x) * segFrac) * W;
          const ay = (fromPos.y + (toPos.y - fromPos.y) * segFrac) * H;

          // Glow
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.beginPath();
          ctx.arc(ax, ay, 7, 0, Math.PI * 2);
          ctx.fill();

          // Siren colors alternating
          const sirenColor = Math.floor(f / 4) % 2 === 0 ? "#ff2d55" : "#0066ff";
          ctx.fillStyle = sirenColor;
          ctx.beginPath();
          ctx.arc(ax, ay, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(ax, ay, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Border
      ctx.strokeStyle = "rgba(0,80,100,0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [cctvs, activeRoute, ambulanceProgress]);

  return (
    <div className="px-2 py-2">
      <div className="text-[8px] font-mono text-gray-600 tracking-widest mb-1.5">CITY MINIMAP</div>
      <canvas
        ref={canvasRef}
        width={144}
        height={130}
        className="rounded"
        style={{ imageRendering: "pixelated", width: "144px", height: "130px" }}
      />
      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        <LegendDot color="#00ff88" label="NORMAL" />
        <LegendDot color="#ffaa00" label="HIGH" />
        <LegendDot color="#ff2244" label="EMERG" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      <span className="text-[7px] font-mono text-gray-600">{label}</span>
    </div>
  );
}
