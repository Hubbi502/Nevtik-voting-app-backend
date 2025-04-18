import { loginSchema, registerSchema } from "../validation/userSchema.js";
import { request, response } from "express";
import { verifyToken } from "../libs/jwt.js";
import prisma from "../utils/prisma.js";
import { requireClerkAuth } from "./clerk.middleware.js";
import { parseCsv } from "../utils/csv-parser.js";
import fs from 'fs/promises';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const isLoginValid = async (req = request, res = response, next)=>{
  const {email, password} = req.body;
  // cek data yang masuk
  if(!email || !password) { 
    return res.status(400).json({
      message:"data incomplete"
    });
  }
  // validasi data
  const isValid = await loginSchema.safeParseAsync({
    email:email,
    password:password
  });
  if(!isValid.success){
    return res.status(400).json({
      message: isValid.error.errors[0].message
    });
  }
  next();
}

export const isRegisterValid = async (req = request, res = response, next)=>{
  const {name, password, email, divisi, role} = req.body;
  
    // cek data yang dikirimkan
    if(!name || !password || !email || !divisi || !role) {
      return res.status(400).json({
        message:"data incomplete"
      });
    }
  
    // validasi data
    const isDataValid = await registerSchema.safeParseAsync({
      name:name, 
      password:password, 
      email:email,
      divisi:divisi,
      role:role
    });
    if(!isDataValid.success){
      return res.status(400).json({
        message: isDataValid.error.errors[0].message
      });
    }
  
    // cek apakah email sudah ada
    const userUnavailable = await prisma.user.findUnique({
      where:{
        email:email
      }
    });
    if(userUnavailable){
      return res.status(400).json({
        message: "email sudah digunakan"
      });
    }
    next();
}

export const isAuthorized = async (req, res, next) => {
  const authStrategy = req.authStrategy;

  //switch case untuk menentukan authStrategy jwt atau clerk
  switch (authStrategy) {
    case 'clerk':
      return requireClerkAuth(req, res, next);
    
    case 'jwt':
    default:
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ message: "Invalid token" });
      }

      if (decoded.userId.role !== "ADMIN"){
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.user = decoded;
      next();
      break;
  }
};

export const isDataValid = async (req, res, next) => {
  const { filename } = req.params;

  if (!filename) {
    return res.status(400).json({ message: "Data incomplete" });
  }

  const filePath = __dirname + "/../../uploads/data/" + filename;

  try {
    await fs.access(filePath); 
    const results = await parseCsv(filePath);

    for (const user of results) {
      const { email, name, password, divisi, role } = user;
      if (!email || !name || !password || !divisi || !role) {
        return res.status(400).json({ message: "Invalid : missing data" });
      }

      const isValid = await registerSchema.safeParseAsync({
        name: name,
        password: password,
        email: email,
        divisi: divisi,
        role: role
      });
      if (!isValid.success) {
        return res.status(400).json({ message: isValid.error.errors[0].message });
      }
      const userExists = await prisma.user.findUnique({
        where: {
          email: email
        }
      });
      if (userExists) {
        return res.status(400).json({ 
          message: "Invalid : user already exists",
          user:{
            name:userExists.name,
            email:userExists.email
          }
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: "Error reading CSV file", error: error.message });
  }

  next(); // Call next only if everything is fine
};