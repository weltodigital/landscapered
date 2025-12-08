// Database user store using Prisma
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface User {
  id: string
  email: string
  name: string | null
  hashedPassword: string | null
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email }
  })
}

export async function createUser(userData: {
  email: string
  name?: string | null
  hashedPassword: string
}): Promise<User> {
  return await prisma.user.create({
    data: {
      email: userData.email,
      name: userData.name || null,
      hashedPassword: userData.hashedPassword
    }
  })
}

export async function findUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id }
  })
}