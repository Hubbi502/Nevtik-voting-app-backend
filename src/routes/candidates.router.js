import { Router } from "express";
import { getCandidates, createCandidates, deleteCandidates, getVotes, getVotePercentage, getWinner } from "../controllers/candidates.controller.js";
import { listFiles, serveImage, uploadImage, uploadCSV } from "../controllers/file.controller.js";
import { isAuthorized } from "../middleware/auth.middleware.js";
import { isCandidateValid } from "../middleware/candidates.middleware.js";
import { upload } from "../utils/multer.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const router = Router();

// Existing routes
router.get("/", getCandidates);
router.post("/add", isAuthorized, isCandidateValid, createCandidates);
router.delete("/:id", isAuthorized, deleteCandidates);
router.get("/votes", isAuthorized, getVotes);
router.get("/votes/persen", isAuthorized, getVotePercentage);
router.get("/votes/winner", isAuthorized, getWinner);

// File routes
router.post("/upload/image/:id", isAuthorized, upload.single('image'), uploadImage);
router.get("/img/:filename", serveImage);
router.get("/img/list", listFiles);

export default router;