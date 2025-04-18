import { request, response } from "express";
import { verifyToken } from "../libs/jwt.js";
import prisma from "../utils/prisma.js";

export const addVote = async (req = request, res = response) => {
  const token = req.cookies.token;
  const { candidates } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const vote = await prisma.vote.create({
      data: {
        userId: decoded.userId.id, 
        candidateId: candidates
      },
    });

    res.status(201).json({
      message: "success",
      data: vote,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unsuccess",
      error: error.message,
    });
  }
};

export const getVoteCounts = async (req = request, res = response) => {
  try {
    const totalUsers = await prisma.user.count();
    const votedUsers = await prisma.vote.count();
    const notVotedUsers = totalUsers - votedUsers;

    res.status(200).json({
      message: "successful",
      data: {
        totalUsers,
        votedUsers,
        notVotedUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching vote counts",
      error: error.message
    });
  }
};

export const getVotePercentage = async (req = request, res = response) => {
  try {
    const totalUsers = await prisma.user.count();
    const votedUsers = await prisma.vote.count();
    
    const votedPercentage = totalUsers > 0 ? (votedUsers / totalUsers) * 100 : 0;
    const notVotedPercentage = 100 - votedPercentage;

    res.status(200).json({
      message: "successful",
      data: {
        votedPercentage: votedPercentage.toFixed(1) ,
        notVotedPercentage: notVotedPercentage.toFixed(1) 
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching vote percentages",
      error: error.message
    });
  }
};
