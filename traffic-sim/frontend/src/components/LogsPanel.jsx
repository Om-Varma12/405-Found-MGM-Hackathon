function formatCoordinatePair(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 2) return "N/A";
  const [lat, lng] = coordinates;
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
}

function NodeRow({ label, node }) {
  return (
    <div
      style={{
        border: "1px solid #2f4f6a",
        borderRadius: 8,
        padding: "8px 10px",
        background: "#0f1f2a",
      }}
    >
      <div style={{ fontWeight: 700, color: "#8fd3ff", fontSize: 13 }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 12, color: "#d7e8f7" }}>Node #{node.index}</div>
      <div style={{ marginTop: 2, fontSize: 12, color: "#d7e8f7" }}>CCTV: {node.cctvId}</div>
      <div style={{ marginTop: 2, fontSize: 12, color: "#d7e8f7" }}>
        Coords: {formatCoordinatePair(node.coordinates)}
      </div>
    </div>
  );
}

export default function LogsPanel({ logs = [], waypoints = null, loading = false }) {
  return (
    <aside
      style={{
        height: "100%",
        overflowY: "auto",
        padding: 16,
        boxSizing: "border-box",
        background:
          "linear-gradient(180deg, #06131d 0%, #0a1b2b 50%, #081725 100%)",
        color: "#eaf4ff",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Simulation Logs</div>

      {loading && (
        <div style={{ marginBottom: 12, color: "#9ec4e3", fontSize: 13 }}>
          Running simulation...
        </div>
      )}

      {!loading && !waypoints && logs.length === 0 && (
        <div style={{ color: "#9ec4e3", fontSize: 13 }}>
          Start simulation to view source, intermediate nodes, destination, and events.
        </div>
      )}

      {waypoints && (
        <section style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Route Nodes</div>
          <div style={{ display: "grid", gap: 8 }}>
            <NodeRow label="Source" node={waypoints.source} />
            {waypoints.intermediate.length === 0 ? (
              <div style={{ fontSize: 12, color: "#9ec4e3" }}>No intermediate nodes.</div>
            ) : (
              waypoints.intermediate.map((node) => (
                <NodeRow key={`mid-${node.cctvId}-${node.index}`} label="Intermediate" node={node} />
              ))
            )}
            <NodeRow label="Destination" node={waypoints.destination} />
          </div>
        </section>
      )}

      {logs.length > 0 && (
        <section>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Event Timeline</div>
          <div style={{ display: "grid", gap: 8 }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  border: "1px solid #2f4f6a",
                  borderRadius: 8,
                  padding: "8px 10px",
                  background: "#0f1f2a",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 12, color: "#8fd3ff" }}>{log.event}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: "#d7e8f7" }}>{log.message}</div>
                <div style={{ marginTop: 4, fontSize: 11, color: "#9ec4e3" }}>
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}
