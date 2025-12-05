import { PrismaClient } from '@prisma/client'

// Configure Prisma Client for development with the local Prisma dev server
export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL || '',
  log: ['query', 'info', 'warn', 'error'],
})