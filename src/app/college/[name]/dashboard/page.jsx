"use client"

import { AppSidebar } from "@/components/App-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge" 
import Carousel from "@/components/ui/carousal"
import WhatsAppButton from "@/components/ui/whatsappButton"
import { motion, AnimatePresence } from "framer-motion"
import { ListingCard } from "@/components/dashboard/ListingCard"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { ListingForm } from "@/components/dashboard/ListingForm"
import { 
  Plus, 
 


  Loader2, 
  ShoppingBag, 
  Briefcase, 
  User 
} from "lucide-react"

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
}

// --- Reusable Components ---

// --- Main Page Component ---

export default function CollegeDashboardPage() {
  const { name: paramName } = useParams()
  const collegeName = decodeURIComponent(paramName || '')
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = useMemo(() => searchParams.get('view') || 'overview', [searchParams])

  const [services, setServices] = useState([])
  const [products, setProducts] = useState([])
  const [myServices, setMyServices] = useState([])
  const [myProducts, setMyProducts] = useState([])
  
  // Consolidating loading states
  const [isFetching, setIsFetching] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({ 
    type: 'service', title: '', description: '', price: '', category: '', 
    contactPhone: '', files: [], condition: '', brandModel: '', 
    originalPrice: '', negotiable: false, skills: '', pricingType: '', existingImages: [] 
  })
  
  const [formError, setFormError] = useState('')
  const [open, setOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [user, setUser] = useState(null)
  const [editingId, setEditingId] = useState(null)

  // --- Data Fetching ---
  useEffect(() => {
    async function initData() {
      setIsFetching(true)
      try {
        const [sess, sRes, pRes] = await Promise.all([
          fetch('/api/auth/session').then(r => r.json()),
          fetch('/api/listings?type=service').then(r => r.json()),
          fetch('/api/listings?type=product').then(r => r.json())
        ])
        if (sess?.ok) setUser(sess.user)
        if (sRes?.ok) setServices(sRes.listings)
        if (pRes?.ok) setProducts(pRes.listings)
      } catch (e) {
        console.error(e)
      } finally {
        setIsFetching(false)
      }
    }
    initData()
  }, [])

  useEffect(() => {
    async function loadMine() {
      if (view !== 'mine') return
      try {
        const [sRes, pRes] = await Promise.all([
          fetch('/api/listings?mine=true&type=service').then(r => r.json()),
          fetch('/api/listings?mine=true&type=product').then(r => r.json())
        ])
        if (sRes?.ok) setMyServices(sRes.listings)
        if (pRes?.ok) setMyProducts(pRes.listings)
      } catch (e) { console.error(e) }
    }
    loadMine()
  }, [view])

  // --- Handlers ---
  const handleViewChange = (val) => {
    const params = new URLSearchParams(searchParams)
    params.set('view', val)
    router.push(`?${params.toString()}`)
  }

  async function submitListing(e) {
    e.preventDefault()
    if (!form.title || !form.description) return
    if (!form.contactPhone) { setFormError('Please provide a contact number'); return }
    if (form.type === 'product' && !editingId) {
      const count = (form.files?.filter(Boolean).length || 0)
      if (count < 2) {
        setFormError('Please add at least 2 photos for your product')
        return
      }
    }

    setIsSubmitting(true)
    try {
      let imageUrl
      const uploaded = []
      const allFiles = (form.files || []).filter(Boolean).slice(0, 6)
      const folder = form.type === 'product' ? 'canopy/products' : 'canopy/services'
      const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
      const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''

      const directCloudinary = Boolean(CLOUD_NAME && UPLOAD_PRESET)

      for (const f of allFiles) {
        if (!f) continue
        if (directCloudinary) {
          const fd = new FormData()
          fd.append('file', f)
          fd.append('folder', folder)
          fd.append('upload_preset', UPLOAD_PRESET)
          const up = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
          if (up.ok) {
            const upData = await up.json()
            if (upData?.secure_url) uploaded.push(upData.secure_url)
          } else {
            const errText = await up.text().catch(() => '')
            setFormError(errText || 'Image upload failed')
          }
        } else {
          const fd = new FormData()
          fd.append('file', f)
          fd.append('folder', folder)
          const up = await fetch('/api/upload', { method: 'POST', body: fd })
          if (up.ok) {
            const upData = await up.json()
            if (upData?.ok) uploaded.push(upData.url)
          } else {
            const errText = await up.text().catch(() => '')
            setFormError(errText || 'Image upload failed')
          }
        }
      }
      imageUrl = uploaded[0] || (editingId ? form.existingImages[0] : null)

      // Payload construction
      const basePayload = {
        title: form.title,
        description: form.description,
        price: form.price ? Number(form.price) : undefined,
        category: form.category || undefined,
        imageUrl,
        contactPhone: form.contactPhone,
        negotiable: typeof form.negotiable === 'boolean' ? form.negotiable : undefined,
      }

      const specificPayload = form.type === 'product' ? {
        ...basePayload,
        condition: form.condition || undefined,
        brandModel: form.brandModel || undefined,
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        images: editingId ? [...(form.existingImages || []), ...uploaded] : uploaded
      } : {
        ...basePayload,
        skills: form.skills || undefined,
        pricingType: form.pricingType || undefined,
        images: uploaded
      }

      if (editingId) {
        const res = await fetch(`/api/listings/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(specificPayload) })
        const data = await res.json()
        if (data?.ok) {
           // Update local state intelligently
           const updateList = (list) => list.map(l => l.id === editingId ? data.listing : l)
           setMyServices(updateList)
           setMyProducts(updateList)
           setServices(updateList)
           setProducts(updateList)
           setEditingId(null)
           setOpen(false)
        }
      } else {
        const res = await fetch('/api/listings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...specificPayload, type: form.type }) })
        const data = await res.json()
        if (data?.ok) {
          if (form.type === 'service') setServices([data.listing, ...services])
          else setProducts([data.listing, ...products])
          resetForm(form.type)
          setOpen(false)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = (type) => {
    setForm({ 
      type, title: '', description: '', price: '', category: '', 
      contactPhone: '', files: [], condition: '', brandModel: '', 
      originalPrice: '', negotiable: false, skills: '', pricingType: '', existingImages: [] 
    })
    setFormError('')
  }

  async function deleteListing(id) {
    if(!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data?.ok) {
        setMyServices(prev => prev.filter(l => l.id !== id))
        setMyProducts(prev => prev.filter(l => l.id !== id))
        setServices(prev => prev.filter(l => l.id !== id))
        setProducts(prev => prev.filter(l => l.id !== id))
      }
    } catch (e) { console.error(e) }
  }

  function startEdit(listing) {
    setEditingId(listing.id)
    setForm({
      type: listing.type,
      title: listing.title || '',
      description: listing.description || '',
      price: listing.price ?? '',
      category: listing.category || '',
      files: [],
      condition: listing.condition || '',
      brandModel: listing.brandModel || '',
      originalPrice: listing.originalPrice ?? '',
      negotiable: !!listing.negotiable,
      contactPhone: listing.contactPhone || '',
      skills: listing.skills || '',
      pricingType: listing.pricingType || '',
      existingImages: Array.isArray(listing.images) && listing.images.length ? listing.images : (listing.imageUrl ? [listing.imageUrl] : [])
    })
    setOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Header Section */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-md transition-all">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-900">{collegeName}</span>
              <span>/</span>
              <span className="capitalize">{view}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
               {/* User Avatar Placeholder */}
               <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0) || <User className="w-4 h-4"/>}
               </div>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
            
            {/* Dashboard Intro */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Marketplace
                </h1>
                <p className="text-slate-500">
                  Discover products and services within your campus.
                </p>
              </div>

              {/* View Switcher */}
              <div className="bg-white p-1 rounded-lg border shadow-sm inline-flex">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'services', label: 'Services' },
                  { id: 'products', label: 'Products' },
                  { id: 'mine', label: 'My Listings' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleViewChange(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      view === tab.id 
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
              {isFetching ? (
                <div className="flex items-center justify-center h-64 w-full">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : (
                <motion.div
                  key={view}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: 10 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {/* Overview View */}
                  {view === 'overview' && (
                    <>
                      <div className="col-span-full mb-2 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-indigo-600"/>
                        <h2 className="text-xl font-semibold">Latest Products</h2>
                      </div>
                      {products.slice(0, 4).map(p => (
                        <ListingCard key={p.id} item={p} type="product" onClick={() => { setSelected(p); setDetailOpen(true) }} />
                      ))}
                      {products.length === 0 && <EmptyState type="products" />}
                      
                      <div className="col-span-full mt-8 mb-2 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-indigo-600"/>
                        <h2 className="text-xl font-semibold">Recent Services</h2>
                      </div>
                      {services.slice(0, 4).map(s => (
                        <ListingCard key={s.id} item={s} type="service" onClick={() => { setSelected(s); setDetailOpen(true) }} />
                      ))}
                       {services.length === 0 && <EmptyState type="services" />}
                    </>
                  )}

                  {/* Products View */}
                  {view === 'products' && (
                    products.length > 0 
                    ? products.map(p => <ListingCard key={p.id} item={p} type="product" onClick={() => { setSelected(p); setDetailOpen(true) }} />)
                    : <EmptyState type="products" />
                  )}

                  {/* Services View */}
                  {view === 'services' && (
                     services.length > 0 
                     ? services.map(s => <ListingCard key={s.id} item={s} type="service" onClick={() => { setSelected(s); setDetailOpen(true) }} />)
                     : <EmptyState type="services" />
                  )}

                  {/* My Listings View */}
                  {view === 'mine' && (
                    <>
                      <div className="col-span-full mb-2"><h2 className="text-xl font-semibold border-b pb-2">My Services</h2></div>
                      {myServices.length > 0 ? myServices.map(s => (
                        <ListingCard key={s.id} item={s} type="service" isMine onEdit={startEdit} onDelete={deleteListing} onClick={() => { setSelected(s); setDetailOpen(true) }} />
                      )) : <div className="col-span-full text-slate-400 italic">No services posted yet.</div>}

                      <div className="col-span-full mt-8 mb-2"><h2 className="text-xl font-semibold border-b pb-2">My Products</h2></div>
                      {myProducts.length > 0 ? myProducts.map(p => (
                        <ListingCard key={p.id} item={p} type="product" isMine onEdit={startEdit} onDelete={deleteListing} onClick={() => { setSelected(p); setDetailOpen(true) }} />
                      )) : <div className="col-span-full text-slate-400 italic">No products posted yet.</div>}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Floating Action Button */}
          {(view === 'services' || view === 'products') && (
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="fixed bottom-8 right-8 z-50"
            >
              <Button 
                onClick={() => { 
                  setEditingId(null); 
                  resetForm(view === 'products' ? 'product' : 'service'); 
                  setOpen(true) 
                }} 
                className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 flex items-center justify-center transition-all hover:scale-110"
              >
                <Plus className="w-6 h-6 text-white" />
              </Button>
            </motion.div>
          )}

          {/* --- DIALOGS --- */}
          
          {/* Add/Edit Listing Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} {form.type === 'product' ? 'Product' : 'Service'}</DialogTitle>
                <DialogDescription>
                  Fill in the details below to list your item on the marketplace.
                </DialogDescription>
              </DialogHeader>
              
              <ListingForm
                form={form}
                setForm={setForm}
                isSubmitting={isSubmitting}
                submitListing={submitListing}
                formError={formError}
                editingId={editingId}
                onCancel={() => setOpen(false)}
                setFormError={setFormError}
              />
            </DialogContent>
          </Dialog>

          {/* Product Detail Modal */}
          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
              <DialogTitle className="sr-only">{selected?.title || 'Listing Details'}</DialogTitle>
               {selected && (
                 <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
                       <Carousel 
                         images={(selected.images && selected.images.length ? selected.images : (selected.imageUrl ? [selected.imageUrl] : []))} 
                         className="w-full" 
                         height="100%" 
                       />
                    </div>
                    <div className="w-full md:w-1/2 p-6 flex flex-col">
                       <div className="flex justify-between items-start">
                         <div>
                            <Badge variant="secondary" className="mb-2">{selected.category}</Badge>
                            <h2 className="text-2xl font-bold text-slate-900">{selected.title}</h2>
                         </div>
                         <div className="text-right">
                           <div className="text-xl font-bold text-indigo-600">₹{selected.price}</div>
                           {selected.negotiable && <span className="text-xs text-green-600 font-medium">Negotiable</span>}
                         </div>
                       </div>
                       
                       <div className="mt-6 space-y-4 flex-1">
                          {selected.type === 'product' ? (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <span className="block text-slate-400 text-xs uppercase">Condition</span>
                                <span className="font-medium">{selected.condition || 'N/A'}</span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <span className="block text-slate-400 text-xs uppercase">Brand</span>
                                <span className="font-medium">{selected.brandModel || 'N/A'}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <span className="block text-slate-400 text-xs uppercase">Skills/Tools</span>
                                <span className="font-medium">{selected.skills || 'N/A'}</span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <span className="block text-slate-400 text-xs uppercase">Pricing</span>
                                <span className="font-medium">{(selected.pricingType || '').replace('_', ' ') || 'N/A'}</span>
                              </div>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-slate-900 mb-1">Description</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">{selected.description}</p>
                          </div>
                       </div>

                       <div className="mt-8 pt-4 border-t flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">{selected.user?.name?.charAt(0)}</div>
                             <div className="text-sm">
                               <p className="font-medium text-slate-900">{selected.user?.name}</p>
                               <p className="text-slate-400 text-xs">Seller</p>
                             </div>
                          </div>
                          {selected.contactPhone && <WhatsAppButton phone={selected.contactPhone} productName={selected.title} type={selected.type} compact />}
                       </div>
                    </div>
                 </div>
               )}
            </DialogContent>
          </Dialog>

        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
