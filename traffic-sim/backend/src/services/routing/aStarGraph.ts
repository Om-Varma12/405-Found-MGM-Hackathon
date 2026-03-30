import type { Graph } from "./roadGraph";

function heuristic(a: Node, b: Node): number {
  return Math.hypot(a.lat - b.lat, a.lng - b.lng);
}

interface Node {
  lat: number;
  lng: number;
}

const roadWeights: Record<string, number> = {
  motorway: 1,
  trunk: 1.2,
  primary: 1.5,
  secondary: 2,
  tertiary: 2.5,
  residential: 5,
};

export function aStarGraph(
  graph: Graph,
  startId: number,
  goalId: number
): [number, number][] {
  const openSet = [startId];

  const cameFrom = new Map<number, number>();
  const gScore = new Map<number, number>();
  const fScore = new Map<number, number>();

  gScore.set(startId, 0);
  fScore.set(startId, 0);

  while (openSet.length > 0) {
    openSet.sort(
      (a, b) =>
        (fScore.get(a) ?? Infinity) - (fScore.get(b) ?? Infinity)
    );

    const current = openSet.shift()!;
    if (current === goalId) {
      const path: [number, number][] = [];
      let temp: number | undefined = current;

      while (temp !== undefined) {
        const node = graph.nodes.get(temp)!;
        path.push([node.lat, node.lng]);
        temp = cameFrom.get(temp);
      }

      return path.reverse();
    }

    const neighbors = graph.edges.get(current) || [];

    for (const edge of neighbors) {
      const neighbor = edge.to;

      const currNode = graph.nodes.get(current)!;
      const neighNode = graph.nodes.get(neighbor)!;

      const weight = roadWeights[edge.type] || 5;

      const tentative =
        (gScore.get(current) ?? Infinity) +
        heuristic(currNode, neighNode) * weight;

      if (tentative < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentative);
        fScore.set(
          neighbor,
          tentative + heuristic(neighNode, graph.nodes.get(goalId)!)
        );

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return [];
}
