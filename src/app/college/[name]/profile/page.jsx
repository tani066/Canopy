"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/App-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { User } from "lucide-react"

export default function ProfilePage() {
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

  return (
    <div className="min-h-screen bg-slate-50">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="p-6 md:p-10 max-w-5xl mx-auto w-full">
            <div className="bg-white rounded-xl border shadow-sm p-6 md:p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
                  {user?.name?.charAt(0) || <User className="w-8 h-8" />}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900">{user?.name || 'User'}</h1>
                  {user?.collegeName && (
                    <p className="text-slate-500">{user.collegeName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-slate-500">Contact</h2>
                  {user?.email && <p className="text-slate-800">Email: {user.email}</p>}
                  {user?.phone && <p className="text-slate-800">Phone: {user.phone}</p>}
                </div>
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-slate-500">Account</h2>
                  {user?.role && <p className="text-slate-800">Role: {user.role}</p>}
                  {user?.createdAt && <p className="text-slate-800">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>}
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

