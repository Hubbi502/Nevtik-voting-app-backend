import { request, response } from 'express';
import prisma from "../utils/prisma.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCsv } from '../utils/csv-parser.js';
import { hash } from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const serveImage = (req = request, res = response) => {
  const filePath = path.join(__dirname, '../../uploads/img', req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.sendFile(filePath);
}

export const listFiles = (req = request, res = response) => {
  const uploadsDir = path.join(__dirname, '../../uploads');

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Gagal membaca folder uploads' });
    }

    const fileList = files.map(file => ({
      filename: file,
      url: `http://localhost:5000/candidates/img/${file}`
    }));

    res.json(fileList);
  })
}

export const uploadImage = async (req = request, res = response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { id } = req.params;
  const imageUrl = `http://localhost:5000/candidates/img/${req.file.filename}`;

  try {
    const updatedCandidate = await prisma.candidate.update({
      where: { id },
      data: { image: imageUrl }
    });

    res.status(200).json({
      message: "Image uploaded successfully",
      data: {
        id: updatedCandidate.id,
        image: updatedCandidate.image
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating candidate image",
      error: error.message
    });
  }
};

export const readCSV = async (req = request, res = response) => {
  const filePath = path.join(__dirname, '../../uploads/data', req.params.filename);

  try {
    const users = await parseCsv(filePath);
    const stats = { total: users.length, successful: 0, skipped: [] };

    const existingEmails = new Set(
      (await prisma.user.findMany({ select: { email: true } }))
        .map(user => user.email.toLowerCase())
    );

    for (const user of users) {
      try {
        if (existingEmails.has(user.email.toLowerCase())) {
          stats.skipped.push({
            name: user.name,
            email: user.email,
            reason: 'Email already exists'
          });
          continue;
        }

        const hashedPassword = await hash(user.password || 'defaultPass123', 10);
        await prisma.user.create({
          data: {
            name: user.name,
            email: user.email,
            password: hashedPassword,
            divisi: user.divisi || 'General',
            role: user.role || 'USER'
          }
        });

        existingEmails.add(user.email.toLowerCase());
        stats.successful++;

      } catch (error) {
        stats.skipped.push({
          name: user.name,
          email: user.email,
          reason: error.message
        });
      }

      if ((stats.successful + stats.skipped.length) % 50 === 0) {
        console.log(`Processed ${stats.successful + stats.skipped.length}/${stats.total} users`);
      }
    }

    return res.status(200).json({
      message: "CSV processing completed",
      summary: {
        total: stats.total,
        successful: stats.successful,
        skipped: stats.skipped.length
      },
      skipped: stats.skipped
    });

  } catch (error) {
    console.error('CSV processing error:', error);
    return res.status(500).json({
      message: "Error reading CSV file",
      error: error.message
    });
  }
};

export const uploadCSV = async (req = request, res = response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.status(200).json({
    message: "CSV file uploaded successfully",
    filename: req.file.filename
  });
};
