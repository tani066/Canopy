"use client"
import { AppSidebar } from "@/components/App-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

function Carousel({ images, fallback, alt, className }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!images || images.length <= 1) return
    const t = setInterval(() => setI(prev => (prev + 1) % images.length), 2500)
    return () => clearInterval(t)
  }, [images])
  const src = (images && images[i]) || fallback
  if (!src) return null
  return <img src={src} alt={alt} className={className || "w-full h-40 object-cover"} />
}

function Section({ type, items }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((it) => (
          <div key={it.id} className="bg-white rounded-lg shadow p-0 overflow-hidden animate-in fade-in cursor-pointer" onClick={it.onClick}
          >
            {type === 'product' ? (
              <Carousel images={it.images} fallback={it.imageUrl} alt={it.title} className="w-full h-40 object-cover" />
            ) : (
              it.imageUrl ? (
                <img src={it.imageUrl} alt={it.title} className="w-full h-40 object-cover" />
              ) : null
            )}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{it.title}</h3>
                  <div className="mt-1 text-sm text-gray-600">{it.category}</div>
                </div>
                {typeof it.price === 'number' ? (
                  <div className="text-right">
                    <div className="text-base font-semibold text-gray-900">₹{it.price}</div>
                    {type === 'product' && typeof it.originalPrice === 'number' ? (
                      <div className="text-xs text-gray-500 line-through">₹{it.originalPrice}</div>
                    ) : null}
                    {type === 'product' && it.negotiable ? <div className="mt-1 inline-block rounded bg-green-50 text-green-700 text-xs px-2 py-1">Negotiable</div> : null}
                  </div>
                ) : null}
              </div>
              {type === 'product' && it.condition ? <div className="mt-2 text-sm text-gray-700">Condition: {it.condition}</div> : null}
              {type === 'product' && it.brandModel ? <div className="mt-1 text-sm text-gray-700">Brand/Model: {it.brandModel}</div> : null}
              <p className="text-gray-700 mt-3">{it.description}</p>
              <div className="mt-3 text-sm text-gray-500">By {it.user?.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CollegeDashboardPage() {
  const { name: paramName } = useParams()
  const collegeName = decodeURIComponent(paramName || '')
  const searchParams = useSearchParams()
  const view = useMemo(() => searchParams.get('view') || 'overview', [searchParams])
  const [services, setServices] = useState([])
  const [products, setProducts] = useState([])
  const [myServices, setMyServices] = useState([])
  const [myProducts, setMyProducts] = useState([])
  const [form, setForm] = useState({ type: 'service', title: '', description: '', price: '', category: '', file: null, files: [], condition: '', brandModel: '', originalPrice: '', negotiable: false })
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [user, setUser] = useState(null)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const s = await fetch('/api/auth/session')
        const sd = await s.json()
        if (sd?.ok) setUser(sd.user)
      } catch (e) {}
      try {
        const resS = await fetch('/api/listings?type=service')
        const dataS = await resS.json()
        if (dataS?.ok) setServices(dataS.listings)
      } catch (e) {}
      try {
        const resP = await fetch('/api/listings?type=product')
        const dataP = await resP.json()
        if (dataP?.ok) setProducts(dataP.listings)
      } catch (e) {}
    }
    load()
  }, [])

  useEffect(() => {
    async function loadMine() {
      if (view !== 'mine') return
      try {
        const resS = await fetch('/api/listings?mine=true&type=service')
        const dataS = await resS.json()
        if (dataS?.ok) setMyServices(dataS.listings)
      } catch (e) {}
      try {
        const resP = await fetch('/api/listings?mine=true&type=product')
        const dataP = await resP.json()
        if (dataP?.ok) setMyProducts(dataP.listings)
      } catch (e) {}
    }
    loadMine()
  }, [view])

  async function submitListing(e) {
    e.preventDefault()
    if (!form.title || !form.description) return
    setLoading(true)
    try {
      let imageUrl
      const uploaded = []
      const allFiles = (form.files || []).slice(0, 6)
      if (form.file) allFiles.unshift(form.file)
      for (const f of allFiles) {
        if (!f) continue
        const fd = new FormData()
        fd.append('file', f)
        fd.append('folder', form.type === 'product' ? 'canopy/products' : 'canopy/services')
        const up = await fetch('/api/upload', { method: 'POST', body: fd })
        const upData = await up.json()
        if (upData?.ok) {
          uploaded.push(upData.url)
        }
      }
      imageUrl = uploaded[0]
      if (editingId) {
        const payload = form.type === 'product' ? {
          title: form.title,
          description: form.description,
          price: form.price ? Number(form.price) : undefined,
          category: form.category || undefined,
          imageUrl,
          condition: form.condition || undefined,
          brandModel: form.brandModel || undefined,
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
          negotiable: !!form.negotiable,
          images: uploaded.length ? uploaded : undefined
        } : {
          title: form.title,
          description: form.description,
          price: form.price ? Number(form.price) : undefined,
          category: form.category || undefined,
          imageUrl
        }
        const res = await fetch(`/api/listings/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        const data = await res.json()
        if (data?.ok) {
          setMyServices(prev => prev.map(l => l.id === editingId ? data.listing : l))
          setMyProducts(prev => prev.map(l => l.id === editingId ? data.listing : l))
          setEditingId(null)
          setOpen(false)
        }
      } else {
        const payload = form.type === 'product' ? {
          type: form.type,
          title: form.title,
          description: form.description,
          price: form.price ? Number(form.price) : undefined,
          category: form.category || undefined,
          imageUrl,
          condition: form.condition || undefined,
          brandModel: form.brandModel || undefined,
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
          negotiable: !!form.negotiable,
          images: uploaded
        } : {
          type: form.type,
          title: form.title,
          description: form.description,
          price: form.price ? Number(form.price) : undefined,
          category: form.category || undefined,
          imageUrl
        }
        const res = await fetch('/api/listings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        const data = await res.json()
        if (data?.ok) {
          if (form.type === 'service') setServices([data.listing, ...services])
          else setProducts([data.listing, ...products])
          setForm({ type: form.type, title: '', description: '', price: '', category: '', file: null, files: [], condition: '', brandModel: '', originalPrice: '', negotiable: false })
          setOpen(false)
        }
      }
    } catch (e) {}
    setLoading(false)
  }

  async function deleteListing(id) {
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data?.ok) {
        setMyServices(prev => prev.filter(l => l.id !== id))
        setMyProducts(prev => prev.filter(l => l.id !== id))
      }
    } catch (e) {}
  }

  function startEdit(listing) {
    setEditingId(listing.id)
    setForm({
      type: listing.type,
      title: listing.title || '',
      description: listing.description || '',
      price: listing.price ?? '',
      category: listing.category || '',
      file: null,
      files: [],
      condition: listing.condition || '',
      brandModel: listing.brandModel || '',
      originalPrice: listing.originalPrice ?? '',
      negotiable: !!listing.negotiable
    })
    setOpen(true)
  }

  

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <SidebarInset>
          <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{collegeName} Dashboard</h1>
            {view === 'overview' ? (
              <p className="text-gray-700">Browse services and products from your college community.</p>
            ) : null}
            {view === 'services' ? <Section type="service" items={services} /> : null}
            {view === 'products' ? (
              <div>
                <Section type="product" items={products.map(p => ({ ...p, onClick: () => { setSelected(p); setDetailOpen(true) } }))} />
                <div className="hidden" />
              </div>
            ) : null}
            {view === 'mine' ? (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{user?.name}&apos;s Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {myServices.map((it) => (
                      <div key={it.id} className="bg-white rounded-lg shadow overflow-hidden animate-in fade-in">
                        {it.imageUrl ? <img src={it.imageUrl} alt={it.title} className="w-full h-40 object-cover" /> : null}
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">{it.title}</h3>
                            {typeof it.price === 'number' ? <span className="text-sm text-gray-700">₹{it.price}</span> : null}
                          </div>
                          <p className="text-gray-700 mt-2">{it.description}</p>
                          <div className="mt-3 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => startEdit(it)}>Edit</Button>
                            <Button variant="destructive" onClick={() => deleteListing(it.id)}>Delete</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{user?.name}&apos;s Products</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {myProducts.map((it) => (
                      <div key={it.id} className="bg-white rounded-lg shadow overflow-hidden animate-in fade-in">
                        {it.imageUrl ? <img src={it.imageUrl} alt={it.title} className="w-full h-40 object-cover" /> : null}
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">{it.title}</h3>
                            {typeof it.price === 'number' ? <span className="text-sm text-gray-700">₹{it.price}</span> : null}
                          </div>
                          <p className="text-gray-700 mt-2">{it.description}</p>
                          <div className="mt-3 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => startEdit(it)}>Edit</Button>
                            <Button variant="destructive" onClick={() => deleteListing(it.id)}>Delete</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          {(view === 'services' || view === 'products') && (
            <div className="fixed bottom-6 right-6">
              <Button onClick={() => { setEditingId(null); setForm(prev => ({ ...prev, type: view === 'products' ? 'product' : 'service', title: '', description: '', price: '', category: '', file: null, files: [], condition: '', brandModel: '', originalPrice: '', negotiable: false })); setOpen(true) }} className="animate-in fade-in zoom-in bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg rounded-full px-4 py-3">
                Add your {view === 'products' ? 'product' : 'service'}
              </Button>
            </div>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add {form.type === 'product' ? 'Product' : 'Service'}</DialogTitle>
                <DialogDescription>Fill details and upload photos.</DialogDescription>
              </DialogHeader>
              <form onSubmit={submitListing} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input placeholder={form.type === 'product' ? 'Product title' : 'Service title'} value={form.title ?? ''} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} />
                  {form.type === 'product' ? (
                    <select value={form.category ?? ''} onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))} className="border rounded px-3 py-2">
                      <option value="">Select category</option>
                      <option>Books</option>
                      <option>Electronics</option>
                      <option>Hostel essentials</option>
                      <option>Clothing</option>
                      <option>Cycle</option>
                      <option>Accessories</option>
                      <option>Others</option>
                    </select>
                  ) : (
                    <Input placeholder="Category" value={form.category ?? ''} onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))} />
                  )}
                  <textarea placeholder="Description" value={form.description ?? ''} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} className="border rounded px-3 py-2 h-24 col-span-1 md:col-span-2" />
                  {form.type === 'product' ? (
                    <>
                      <select value={form.condition ?? ''} onChange={(e) => setForm(prev => ({ ...prev, condition: e.target.value }))} className="border rounded px-3 py-2">
                        <option value="">Condition</option>
                        <option>New</option>
                        <option>Like New</option>
                        <option>Good</option>
                        <option>Used</option>
                        <option>Heavily Used</option>
                      </select>
                      <Input placeholder="Brand/Model (optional)" value={form.brandModel ?? ''} onChange={(e) => setForm(prev => ({ ...prev, brandModel: e.target.value }))} />
                      <Input placeholder="Selling Price (₹)" value={String(form.price ?? '')} onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))} />
                      <Input placeholder="Original Price (optional)" value={String(form.originalPrice ?? '')} onChange={(e) => setForm(prev => ({ ...prev, originalPrice: e.target.value }))} />
                      <div className="flex items-center gap-2">
                        <input id="negotiable" type="checkbox" checked={form.negotiable} onChange={(e) => setForm(prev => ({ ...prev, negotiable: e.target.checked }))} />
                        <label htmlFor="negotiable" className="text-sm text-gray-700">Is the price negotiable?</label>
                      </div>
                    </>
                  ) : (
                    <Input placeholder="Price (optional)" value={String(form.price ?? '')} onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))} />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{form.type === 'product' ? 'Product Photos (1–6)' : 'Service Photo (optional)'}</label>
                  <input type="file" accept="image/*" multiple onChange={(e) => setForm(prev => ({ ...prev, files: Array.from(e.target.files || []) }))} className="w-full" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={loading} className="bg-linear-to-r from-blue-600 to-indigo-600 text-white">Add</Button>
                </div>
              </form>
          </DialogContent>
          </Dialog>
          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent>
              {selected ? (
                <div className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>{selected.title || 'Product Details'}</DialogTitle>
                    <DialogDescription>View all information and photos</DialogDescription>
                  </DialogHeader>
                  <Carousel images={selected.images} fallback={selected.imageUrl} alt={selected.title} className="w-full h-56 object-cover rounded" />
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selected.title}</h3>
                      <div className="mt-1 text-sm text-gray-600">{selected.category}</div>
                    </div>
                    {typeof selected.price === 'number' ? (
                      <div className="text-right">
                        <div className="text-base font-semibold text-gray-900">₹{selected.price}</div>
                        {typeof selected.originalPrice === 'number' ? <div className="text-xs text-gray-500 line-through">₹{selected.originalPrice}</div> : null}
                        {selected.negotiable ? <div className="mt-1 inline-block rounded bg-green-50 text-green-700 text-xs px-2 py-1">Negotiable</div> : null}
                      </div>
                    ) : null}
                  </div>
                  {selected.condition ? <div className="text-sm text-gray-700">Condition: {selected.condition}</div> : null}
                  {selected.brandModel ? <div className="text-sm text-gray-700">Brand/Model: {selected.brandModel}</div> : null}
                  <p className="text-gray-700">{selected.description}</p>
                  <div className="text-sm text-gray-500">By {selected.user?.name}</div>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}