# 🏗️ FINAL BACKEND ARCHITECTURE

Use:

* Node.js + Express (fastest for you)
* TypeScript (you’re already using it)

---

## 📁 FOLDER STRUCTURE (CLEAN + SCALABLE)

```id="backend-structure"
backend/
 ├── src/
 │    ├── controllers/
 │    │     └── simulationController.ts
 │
 │    ├── services/
 │    │     ├── routing/
 │    │     │     ├── hybridRouting.ts
 │    │     │     ├── aStarGraph.ts
 │    │     │     ├── roadGraph.ts
 │    │     │     └── orsRouting.ts
 │    │     │
 │    │     ├── cctv/
 │    │     │     ├── cctvService.ts
 │    │     │     └── violationService.ts
 │    │     │
 │    │     ├── simulation/
 │    │     │     └── simulationEngine.ts
 │    │
 │    ├── routes/
 │    │     └── simulationRoutes.ts
 │
 │    ├── models/
 │    │     ├── Hospital.ts
 │    │     ├── CCTVNode.ts
 │    │     └── EventLog.ts
 │
 │    ├── utils/
 │    │     └── helpers.ts
 │
 │    ├── config/
 │    │     └── env.ts
 │
 │    └── server.ts
```

---

# 🔥 HOW YOUR CURRENT FILES MAP TO BACKEND

| Your File          | Move To                                    |
| ------------------ | ------------------------------------------ |
| `hybridRouting.ts` | `services/routing/`                        |
| `aStarGraph.ts`    | `services/routing/`                        |
| `roadGraph.ts`     | `services/routing/`                        |
| `orsRouting.ts`    | `services/routing/`                        |
| `astar.js`         | ❌ remove (you have better version already) |

---

# 🧠 CORE BACKEND MODULES

---

## 1️⃣ 🚑 SIMULATION ENGINE (MOST IMPORTANT)

### `simulationEngine.ts`

This is your **brain**

```ts id="simulation-engine"
export async function runSimulation(source, destination) {
  const logs = [];

  logs.push("🚨 Request received");

  // 1. Fetch routes
  const routes = await fetchRoutes(source, destination);

  // 2. Pick best route
  let best = routes[0];
  let bestScore = scoreRoute(best);

  for (const r of routes) {
    const score = scoreRoute(r);
    if (score < bestScore) {
      best = r;
      bestScore = score;
    }
  }

  logs.push("🧭 Best route selected");

  // 3. Generate CCTV nodes
  const cctvs = generateCCTVNodes(best.path);

  logs.push("📡 CCTV nodes activated");

  return {
    route: best.path,
    cctvs,
    logs,
  };
}
```

---

## 2️⃣ 📡 CCTV SERVICE

### `cctvService.ts`

```ts id="cctv-service"
export function generateCCTVNodes(path) {
  return path.map((point, index) => ({
    id: `S${index}`,
    lat: point[0],
    lng: point[1],
    status: "IDLE",
  }));
}
```

---

## 3️⃣ 🚨 VIOLATION SERVICE

```ts id="violation-service"
export function detectViolation() {
  const random = Math.random();

  if (random < 0.2) {
    return {
      type: "VIOLATION",
      plate: "MH20AB1234",
    };
  }

  return null;
}
```

---

## 4️⃣ 🎮 CONTROLLER

### `simulationController.ts`

```ts id="controller"
import { runSimulation } from "../services/simulation/simulationEngine";

export const startSimulation = async (req, res) => {
  const { source, destination } = req.body;

  try {
    const result = await runSimulation(source, destination);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Simulation failed" });
  }
};
```

---

## 5️⃣ 🌐 ROUTES

### `simulationRoutes.ts`

```ts id="routes"
import express from "express";
import { startSimulation } from "../controllers/simulationController";

const router = express.Router();

router.post("/start", startSimulation);

export default router;
```

---

## 6️⃣ 🚀 SERVER

### `server.ts`

```ts id="server"
import express from "express";
import simulationRoutes from "./routes/simulationRoutes";

const app = express();

app.use(express.json());

app.use("/api/simulation", simulationRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
```

---

# 🔄 FRONTEND ↔ BACKEND FLOW

---

## BEFORE (your current)

```text
Frontend → OSRM → Animation
```

---

## AFTER (correct)

```text
Frontend → Backend → Routing + CCTV + Logic → Frontend
```

---

# 📡 WHAT FRONTEND WILL NOW DO

Instead of computing:

```js
simulate()
```

You’ll call:

```js
fetch("http://localhost:5000/api/simulation/start", {
  method: "POST",
  body: JSON.stringify({
    source,
    destination
  })
})
```
