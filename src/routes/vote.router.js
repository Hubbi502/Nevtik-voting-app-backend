import { Router } from "express";
import { addVote,getVoteCounts, getVotePercentage } from "../controllers/vote.controller.js";
import { isVoteValid } from "../middleware/vote.middleware.js";
import { isAuthorized } from "../middleware/auth.middleware.js";
const router = Router();

router.post("/add",isVoteValid, addVote);
router.get("/total",isAuthorized, getVoteCounts);
router.get("/persen",isAuthorized, getVotePercentage);


export default router;