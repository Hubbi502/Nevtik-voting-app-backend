import { Router } from "express";
import voteRouter from "./vote.router.js";
import candidatesRouter from "./candidates.router.js";
import userRouter from "./auth.router.js";

const router = Router();

// Gunakan semua router
router.use("/vote", voteRouter);
router.use("/candidates", candidatesRouter);
router.use("/auth", userRouter);

export default router;
