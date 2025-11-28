"use client"
import { Home, ListChecks, Package, UserRound, LogOut } from "lucide-react"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
} from "@/components/ui/sidebar"
import { Separator } from '@/components/ui/separator'

const items = [
  { title: "Overview", key: "overview", icon: Home },
  { title: "Services", key: "services", icon: ListChecks },
  { title: "Products", key: "products", icon: Package },
  { title: "My Listings", key: "mine", icon: ListChecks },
]

export function AppSidebar() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (mounted && data?.ok) setUser(data.user)
      } catch (e) {}
    }
    load()
    return () => { mounted = false }
  }, [])

  function navigate(key) {
    const college = encodeURIComponent(user?.collegeName || '')
    const base = college ? `/college/${college}/dashboard` : '/'
    const target = key === 'overview' ? base : `${base}?view=${key}`
    router.replace(target)
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {}
    router.replace('/')
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton onClick={() => navigate(item.key)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Separator />
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2">
            <div className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-semibold">
              {(user?.name || '?').slice(0,1).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name || 'User'}</span>
              <span className="text-xs text-gray-500">{user?.collegeName || ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('profile')} className="text-sm text-blue-600">Profile</button>
            <button onClick={logout} className="text-red-600">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}