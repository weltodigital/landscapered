'use client'

import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'

interface SessionProviderWrapperProps {
  children: React.ReactNode
  session: Session | null
}

export function SessionProviderWrapper({ children, session }: SessionProviderWrapperProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>
}