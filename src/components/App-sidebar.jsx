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
  const [actionsOpen, setActionsOpen] = useState(false)
  // actions are shown via hover popover; state not required
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
    const target = key === 'overview' ? base : (key === 'profile' ? `/college/${college}/profile` : `${base}?view=${key}`)
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
        <div className="relative px-2 py-3">
          {/* Trigger Row */}
          <div className="group flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 hover:bg-slate-100" onClick={() => setActionsOpen(v => !v)}>
            <div className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-semibold">
              {(user?.name || '?').slice(0,1).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name || 'User'}</span>
              <span className="text-xs text-gray-500">{user?.collegeName || ''}</span>
            </div>
          </div>
          {/* Pop-out actions above on hover/tap */}
          <div className={`absolute left-2 right-2 -top-2 -translate-y-full transition-all duration-200 ${actionsOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'} group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto`}>
            <div className="flex items-center justify-between bg-white border rounded-md shadow-md px-3 py-2">
              <button onClick={() => navigate('profile')} className="text-sm text-slate-700 hover:text-indigo-600">Profile</button>
              <button onClick={logout} className="text-sm text-red-600 flex items-center gap-1">
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
