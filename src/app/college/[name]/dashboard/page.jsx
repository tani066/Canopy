import { AppSidebar } from "@/components/App-sidebar"
import { Sidebar, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default async function CollegeDashboardPage({ params }) {
  const resolved = await params
  const collegeName = decodeURIComponent(resolved?.name || '')
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{collegeName} Dashboard</h1>
        <p className="text-gray-700">You are successfully logged in with OTP.</p>
        <div>
          <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger />
          </SidebarProvider>
        </div>
       
      </div>
    </div>
  )
}