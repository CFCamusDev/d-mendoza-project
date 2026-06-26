import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.join(__dirname, '../../../.env');
console.log('Resolving .env at:', envPath);
console.log('Exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  console.log('Dotenv config result error:', result.error);
  console.log('Dotenv config result parsed:', result.parsed ? Object.keys(result.parsed) : 'null');
}

console.log('process.env.DATABASE_URL:', process.env.DATABASE_URL);

// Now import prisma
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const usersCount = await prisma.user.count();
    console.log('Total Users:', usersCount);
  } catch (error) {
    console.error('Error checking DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
