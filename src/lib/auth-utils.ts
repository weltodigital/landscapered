import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Query the actual user from database
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email!
    },
    include: {
      organisations: true
    }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  return user
}

export async function getCurrentUserOrganisation() {
  const user = await getCurrentUser()

  // Return the first organisation the user belongs to
  return user.organisations[0] || null
}