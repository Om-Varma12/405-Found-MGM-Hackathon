import { config } from "../../config/env";

export interface Node {
  id: number;
  lat: number;
  lng: number;
}

export interface Edge {
  to: number;
  type: string;
}

export interface Graph {
  nodes: Map<number, Node>;
  edges: Map<number, Edge[]>;
}

export async function fetchRoadGraph(lat: number, lng: number): Promise<Graph> {
  const query = `
  [out:json][timeout:10];
  way(around:300, ${lat}, ${lng})["highway"~"primary|secondary"];
  out geom;
  `;

  const res = await fetch(config.overpassUrl, {
    method: "POST",
    body: query,
  });

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("Overpass failed:", text);
    throw new Error("Invalid response from Overpass API");
  }

  const nodes = new Map<number, Node>();
  const edges = new Map<number, Edge[]>();

  data.elements.forEach((el: any) => {
    if (el.type === "node") {
      nodes.set(el.id, { id: el.id, lat: el.lat, lng: el.lon });
    }
  });

  data.elements.forEach((el: any) => {
    if (el.type === "way") {
      const roadType = el.tags?.highway || "residential";

      for (let i = 0; i < el.nodes.length - 1; i++) {
        const a = el.nodes[i];
        const b = el.nodes[i + 1];

        if (!edges.has(a)) edges.set(a, []);
        if (!edges.has(b)) edges.set(b, []);

        edges.get(a)!.push({ to: b, type: roadType });
        edges.get(b)!.push({ to: a, type: roadType });
      }
    }
  });

  return { nodes, edges };
}

export function findClosestNode(lat: number, lng: number, graph: Graph): number {
  let bestId = -1;
  let bestDist = Infinity;

  graph.nodes.forEach((node, id) => {
    const d = Math.hypot(node.lat - lat, node.lng - lng);
    if (d < bestDist) {
      bestDist = d;
      bestId = id;
    }
  });

  return bestId;
}
