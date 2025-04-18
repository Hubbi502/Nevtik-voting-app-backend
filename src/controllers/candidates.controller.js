import { request, response } from "express";
import prisma from "../utils/prisma.js";

export const getCandidates = async (req = request, res = response) => {
  try {
    const candidates = await prisma.candidate.findMany();

    res.status(200).json({
      message: "success",
      data: candidates
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching candidates",
      error: error.message
    });
  }
}

export const createCandidates = async (req = request, res = response)=>{
  const {name, vision, mission, divisi, kelas, jurusan} = req.body;
  try{
    const candidate = await prisma.candidate.create({
      data:{
        name:name,
        vision:vision,
        mission:mission,
        divisi: divisi,
        kelas: kelas,
        jurusan: jurusan
      }
    });
    res.status(201).json({
      message: "Candidate berhasil ditambahkan",
      data: {
        id: candidate.id,
        name: candidate.name,
      }
    });
  }catch(error){
    res.status(500).json({
      message:"unsuccessful"
    })
    console.log(error)
  }
}

export const deleteCandidates = async (req = request, res = response)=>{
  const {id} = req.params;
  try{
    const user = await prisma.candidate.delete({
      where:{
        id:id
      }
    })
    res.status(200).json({
      message:"successful",
      user: user
    })
  }catch(error){
    res.status(500).json({
      message:"unsuccessful"
    })
    console.log(error)
  }

}

export const getVotes = async (req = request, res = response)=>{
  try{
    const allCandidates = await prisma.candidate.findMany({
      include:{
        votes:true
      }
    });
    res.status(200).json({
      message:"successful",
      data: allCandidates.map(candidate => ({
        name: candidate.name,
        votes: candidate.votes.length
      }))
    })
  }catch(error){
    res.status(500).json({
      message: "Error fetching candidates",
      error: error.message
    });
  }
}


export const getVotePercentage = async (req = request, res = response) => {
  try {
    const allCandidates = await prisma.candidate.findMany({
      include: {
        votes: true
      }
    });

    // Hitung total semua vote
    const totalVotes = allCandidates.reduce((sum, candidate) => sum + candidate.votes.length, 0);

    res.status(200).json({
      message: "successful",
      data: allCandidates.map(candidate => ({
        name: candidate.name,
        vision: candidate.vision,
        mission: candidate.mission,
        divisi: candidate.divisi,
        image: candidate.image,
        percentage: totalVotes > 0 ? ((candidate.votes.length / totalVotes) * 100).toFixed(1) : "0" 
      }))
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching vote percentages",
      error: error.message
    });
  }
};

export const getWinner = async (req = request, res = response) => {
  try {
    const allCandidates = await prisma.candidate.findMany({
      include: {
        votes: true
      }
    });

    if (allCandidates.length === 0) {
      return res.status(200).json({
        message: "No candidates available",
        data: null
      });
    }

    let maxVotes = Math.max(...allCandidates.map(candidate => candidate.votes.length));

    let winners = allCandidates.filter(candidate => candidate.votes.length === maxVotes);

    res.status(200).json({
      message: winners.length > 1 ? "Seri!" : "Pemenang Ditemukan",
      data: winners.map(winner => ({
        name: winner.name,
        votes: winner.votes.length,
        divisi: winner.divisi,
        image: winner.image,
        percentage: ((winner.votes.length / allCandidates.reduce((sum, candidate) => sum + candidate.votes.length, 0)) * 100).toFixed(1)
      }))
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching winner",
      error: error.message
    });
  }
};

