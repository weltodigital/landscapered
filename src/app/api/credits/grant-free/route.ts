import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { grantFreeCredits } from '@/lib/credits'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    await grantFreeCredits(user.id)

    return NextResponse.json({
      success: true,
      message: 'Free credits granted successfully'
    })
  } catch (error) {
    console.error('Error granting free credits:', error)
    return NextResponse.json(
      { error: 'Failed to grant free credits' },
      { status: 500 }
    )
  }
}