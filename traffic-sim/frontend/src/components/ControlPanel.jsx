import { useState, useRef } from "react";

export default function ControlPanel({ onSimulate, loading = false }) {
  const panelRef = useRef(null);

  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);

  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    setDragging(true);
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const onMouseMove = (e) => {
    if (!dragging) return;

    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const onMouseUp = () => {
    setDragging(false);
  };

  return (
    <div
      ref={panelRef}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        zIndex: 1000,
        background: "#fff",
        padding: "12px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        cursor: dragging ? "grabbing" : "grab",
        userSelect: "none",
        transition: dragging ? "none" : "0.2s ease",
        minWidth: "160px",
      }}
    >
      <div
        onMouseDown={onMouseDown}
        style={{
          fontWeight: "bold",
          marginBottom: "8px",
        }}
      >
        🚑 Control Panel
      </div>

      <button onClick={onSimulate} disabled={loading}>
        {loading ? "⏳ Running..." : "Start Simulation"}
      </button>
    </div>
  );
}
