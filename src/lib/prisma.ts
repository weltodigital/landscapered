import { PrismaClient } from '@prisma/client'

// Configure Prisma Client for Prisma v5
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
})