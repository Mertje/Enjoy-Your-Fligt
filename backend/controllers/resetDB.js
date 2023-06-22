const { PrismaClient } = require("@prisma/client");
const { exec } = require("child_process");

const prisma = new PrismaClient();

(async function dropDB() {
  try {
    await prisma.$executeRaw`DROP DATABASE eyf`;
    console.log("Database deleted successfully");
  } catch (error) {
    console.error("Error deleting database:", error);
  }
})();
