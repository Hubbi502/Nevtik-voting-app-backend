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

export const register = async (req = request, res = response)=>{
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

    const users = await prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        divisi: true
      }
    });

    const total = await prisma.user.count();
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: "success",
      data: users,
      total,
      currentPage: page,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: "Error fetching users",
      error: error.message 
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

