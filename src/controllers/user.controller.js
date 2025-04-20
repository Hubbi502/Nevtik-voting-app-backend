import { compare, hash } from "bcrypt";
import { request, response } from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import { createToken } from "../libs/jwt.js";
import prisma from "../utils/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const login = async (req = request, res = response)=>{
    const {email, password} = req.body;

  const user = await prisma.user.findUnique({
    where:{
      email:email
    }
  });

  if(!user){
    return res.status(404).json({
      message: "user not found"
    });
  }

  const isPasswordValid = await compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid password",
    });
  }

  const token = createToken({ id: user.id, email: user.email, name: user.name, role: user.role});
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 60 * 60 * 1000,
  })


  res.status(200).json({
    message: "success",
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      token: token
    }
  });

}

export const addUser = async (req = request, res = response)=>{
  const {name, password, email, divisi, role} = req.body;

  // hash password
  const hashedPassword = await hash(password, 12);
 
  // menambahkan user
  try{
    const user = await prisma.user.create({
      data: {
        email:email,
        name:name,
        password:hashedPassword,
        divisi: divisi,
        role:role
      }
    });
    res.status(201).json({
      message: "User berhasil ditambahkan",
      data: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  }catch(error){
    console.log(error)
  }
}

export const getUsers = async (req = request, res = response) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const { divisi = "all", statusVote = "all" } = req.query;

    const allowedDivisi = ["Web Development", "ITNSA", "Cyber Security"];
    const allowedStatusVote = ["Vote", "Not Vote", "all"];

    let filter = {};

    // Validasi dan set filter divisi
    if (divisi !== "all") {
      if (!allowedDivisi.includes(divisi)) {
        return res.status(400).json({
          message: "Invalid 'divisi' value. Allowed: Web Development, ITNSA, Cyber Security, or all",
        });
      }
      filter.divisi = divisi;
    }

    // Validasi dan set filter statusVote
    if (statusVote !== "all") {
      if (!["Vote", "Not Vote"].includes(statusVote)) {
        return res.status(400).json({
          message: "Invalid 'statusVote' value. Allowed: Vote, Not Vote, or all",
        });
      }

      filter.vote =
        statusVote === "Vote"
          ? { isNot: null }
          : { is: null };
    }

    const users = await prisma.user.findMany({
      where: filter,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        divisi: true,
        vote: true,
      },
    });

    const total = await prisma.user.count({ where: filter });
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: "success",
      data: users,
      total,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("🔥 Error fetching users:", {
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      message: "Internal server error while fetching users",
      error: error.message,
    });
  }
};





export const getSpecificUser = async (req = request, res = response)=>{
  const {email} = req.params;
  try{
    const user = await prisma.user.findUnique({
      where:{
        email:email
      }
    });
    res.status(200).json({
      message: "success",
      data: user
    });
  }catch(error){
    res.status(500).json({
      message: "Error fetching users",
      error: error.message
    });
  }
}

export const getCurrentUser = async (req= request, res = response)=>{
  res.json(req.user.userId)
}

export const logoutUser = async (req = request, res = response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  res.status(200).json({
    message: "Logout successful",
  });
};


export const deleteUser = async (req = request, res = response) => {
  const { id } = req.body;

  try {
    const user = await prisma.user.delete({
      where: {
        id: id,
      },
    });

    res.status(200).json({
      message: "success",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
};

