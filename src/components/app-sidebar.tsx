'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Home,
  FolderKanban,
  Settings,
  LogOut,
  Calculator,
  User,
  Users,
  Briefcase,
  FileText,
  Calendar,
  Receipt,
  Package,
  DollarSign,
  CreditCard
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

const menuItems = [
  {
    title: 'Dashboard',
    url: '/app',
    icon: Home,
  },
  {
    title: 'Projects',
    url: '/app/projects',
    icon: FolderKanban,
  },
  {
    title: 'Jobs',
    url: '/app/jobs',
    icon: Briefcase,
  },
  {
    title: 'Customers',
    url: '/app/customers',
    icon: Users,
  },
  {
    title: 'Schedule',
    url: '/app/schedule',
    icon: Calendar,
  },
  {
    title: 'Quotes',
    url: '/app/quotes',
    icon: Receipt,
  },
  {
    title: 'Invoices',
    url: '/app/invoices',
    icon: FileText,
  },
  {
    title: 'Materials',
    url: '/app/products',
    icon: Package,
  },
  {
    title: 'Rate Cards',
    url: '/app/rate-cards',
    icon: DollarSign,
  },
  {
    title: 'Pricing',
    url: '/app/pricing',
    icon: CreditCard,
  },
  {
    title: 'Subscription',
    url: '/app/subscription',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    url: '/app/settings',
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 px-4 py-6">
            <img
              src="/logo.png"
              alt="Landscapered"
              className="h-8 w-auto"
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-4 py-2">
              <User className="h-4 w-4" />
              <span className="text-sm truncate">{session?.user?.name}</span>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}