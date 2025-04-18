import { request, response } from "express";
import { voteSchema } from "../validation/voteSchema.js";
import prisma from "../utils/prisma.js";
import { verifyToken } from "../libs/jwt.js";

export const isVoteValid = async (req = request, res = response, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = verifyToken(token);
    const userId = decoded?.userId?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { candidates } = req.body;
    if (!candidates) return res.status(400).json({ message: "Data incomplete" });

    const isDataValid = await voteSchema.safeParseAsync({ candidatesId: candidates });
    if (!isDataValid.success) {
      return res.status(400).json({ message: isDataValid.error.errors[0].message });
    }

    const [candidate, existingVote] = await Promise.all([
      prisma.candidate.findUnique({ where: { id: candidates } }),
      prisma.vote.findUnique({ where: { userId } })
    ]);

    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    if (existingVote) return res.status(400).json({ message: "Vote hanya bisa sekali" }); 

    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
