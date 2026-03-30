import express from "express";
import { startSimulation } from "../controllers/simulationController";

const router = express.Router();

router.post("/start", startSimulation);

export default router;
