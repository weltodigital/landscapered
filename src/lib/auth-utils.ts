import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // For demo purposes, return a mock user structure
  // In production, this would query the database
  return {
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.name || '',
    organisations: []
  }
}

export async function getCurrentUserOrganisation() {
  const user = await getCurrentUser()

  // For demo purposes, return null - user will need to create organization
  return null
}