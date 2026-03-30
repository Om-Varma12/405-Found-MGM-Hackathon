import type { Request, Response } from "express";
import { runSimulation } from "../services/simulation/simulationEngine";

export const startSimulation = async (req: Request, res: Response): Promise<void> => {
  const { source, destination } = req.body;

  if (!source || !destination) {
    res.status(400).json({ error: "source and destination are required" });
    return;
  }

  try {
    const result = await runSimulation(source, destination);
    res.json(result);
  } catch (err) {
    console.error("Simulation error:", err);
    res.status(500).json({ error: "Simulation failed", details: String(err) });
  }
};
