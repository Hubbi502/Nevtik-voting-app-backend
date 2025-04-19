import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.vote.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.user.deleteMany({});

  // Create test users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@nevtik.com",
        password: hashedPassword,
        divisi: "Web Development",
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        name: "Test User 1",
        email: "user1@nevtik.com",
        password: hashedPassword,
        divisi: "ITNSA",
        role: "USER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Test User 2",
        email: "user2@nevtik.com",
        password: hashedPassword,
        divisi: "Cyber Security",
        role: "USER",
      },
    }),
  ]);

  // Create test candidates
  const candidates = await Promise.all([
    prisma.candidate.create({
      data: {
        name: "John Doe",
        vision: JSON.stringify([
          "Improve IT education",
          "Create more learning opportunities",
        ]),
        mission: JSON.stringify([
          "Implement new training programs",
          "Organize monthly workshops",
        ]),
        divisi: "Web Development",
        kelas: "XI",
        jurusan: "RPL",
        image:
          `http://${process.env.BACKEND_URL}/img/1744114390981-261691042.jpg`,
      },
    }),
    prisma.candidate.create({
      data: {
        name: "Lewis Hamilton",
        vision: JSON.stringify([
          "Transform IT education through continuous innovation",
          "Expand learning opportunities for all levels",
          "Introduce cutting-edge training programs",
          "Host engaging monthly workshops to foster growth",
        ]),
        mission: JSON.stringify([
          "Raise awareness about cybersecurity importance",
          "Promote and support ethical hacking practices",
          "Conduct regular hands-on security workshops",
          "Organize CTF competitions to build and test skills",
        ]),
        divisi: "ITNSA",
        kelas: "XI",
        jurusan: "RPL",
        image:
          `http://${process.env.BACKEND_URL}/candidates/img/1744114173725-798079446.jpg`,
      },
    }),
    prisma.candidate.create({
      data: {
        name: "Jane Smith",
        vision: JSON.stringify([
          "Enhance cybersecurity awareness",
          "Promote ethical hacking",
        ]),
        mission: JSON.stringify([
          "Regular security workshops",
          "CTF competitions",
        ]),
        divisi: "Cyber Security",
        kelas: "XI",
        jurusan: "RPL",
        image:
          `http://${process.env.BACKEND_URL}/candidates/img/1744114422507-336692499.jpg`,
      },
    }),
  ]);

  // Create test votes
  await Promise.all([
    prisma.vote.create({
      data: {
        userId: users[1].id,
        candidateId: candidates[0].id,
      },
    }),
    prisma.vote.create({
      data: {
        userId: users[2].id,
        candidateId: candidates[1].id,
      },
    }),
  ]);

  console.log("Test data seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });