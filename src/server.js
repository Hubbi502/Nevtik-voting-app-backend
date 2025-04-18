// src/index.js
import express from "express";
import router from "./routes/index.js";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Create upload directories
const uploadDirs = ['uploads/img', 'uploads/data'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const app = express();


const allowedOrigins = [
  process.env.DEV_FRONTEND_URL,
  process.env.DEPLOY_FRONTEND_URL
];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Important for cookies
}));

app.use(express.json()); 
app.use(cookieParser());
app.use("/", router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});