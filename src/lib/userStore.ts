// Simple in-memory user store for demo purposes
// In production, this would be replaced with database operations

export interface User {
  id: string
  email: string
  name: string
  hashedPassword: string
}

// Shared user store
export const users: User[] = []

export function findUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email)
}

export function createUser(userData: Omit<User, 'id'>): User {
  const newUser: User = {
    id: `user-${Date.now()}`,
    ...userData
  }
  users.push(newUser)
  return newUser
}

export function findUserById(id: string): User | undefined {
  return users.find(u => u.id === id)
}