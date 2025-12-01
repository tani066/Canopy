"use client"

import { Image as ImageIcon, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"

export function ListingForm({ form, setForm, isSubmitting, submitListing, formError, editingId, onCancel, setFormError }) {
  return (
    <form onSubmit={submitListing} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div className="space-y-2 md:col-span-2">
        <Label>Title</Label>
        <Input placeholder="e.g., Engineering Drawing Kit" value={form.title ?? ''} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} className="border-slate-200 focus:ring-indigo-500" />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        {form.type === 'product' ? (
          <select value={form.category ?? ''} onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
            <option value="">Select category</option>
            {['Books', 'Electronics', 'Hostel essentials', 'Clothing', 'Cycle', 'Accessories', 'Others'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        ) : (
          <select value={form.category ?? ''} onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="">Select Service</option>
            {['Tutoring', 'Photography/Videography', 'Assignments/Notes', 'Fitness', 'Coding Support', 'Design', 'Event Mgmt', 'Others'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      <div className="space-y-2">
        <Label>Contact (WhatsApp)</Label>
        <Input placeholder="+91 XXXXX XXXXX" value={form.contactPhone ?? ''} onChange={(e) => setForm(prev => ({ ...prev, contactPhone: e.target.value }))} />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Description</Label>
        <Textarea placeholder="Describe condition, features, or details..." value={form.description ?? ''} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} className="h-24 resize-none" />
      </div>

      {form.type === 'product' ? (
        <>
          <div className="space-y-2">
            <Label>Condition</Label>
            <select value={form.condition ?? ''} onChange={(e) => setForm(prev => ({ ...prev, condition: e.target.value }))} className="flex h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
              <option value="">Condition</option>
              {['New', 'Like New', 'Good', 'Used', 'Heavily Used'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Brand/Model</Label>
            <Input value={form.brandModel ?? ''} onChange={(e) => setForm(prev => ({ ...prev, brandModel: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Selling Price (₹)</Label>
            <Input type="number" value={String(form.price ?? '')} onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Original Price (₹)</Label>
            <Input type="number" value={String(form.originalPrice ?? '')} onChange={(e) => setForm(prev => ({ ...prev, originalPrice: e.target.value }))} />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2 md:col-span-2">
            <Label>Required Skills/Tools</Label>
            <Input placeholder="e.g. Photoshop, DSLR, Python" value={form.skills ?? ''} onChange={(e) => setForm(prev => ({ ...prev, skills: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Pricing Model</Label>
            <select value={form.pricingType ?? ''} onChange={(e) => setForm(prev => ({ ...prev, pricingType: e.target.value }))} className="flex h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
              <option value="">Select Type</option>
              {['per_hour', 'per_session', 'per_month', 'fixed_package'].map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Price (₹)</Label>
            <Input type="number" value={String(form.price ?? '')} onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))} />
          </div>
        </>
      )}

      <div className="md:col-span-2 flex items-center space-x-2 pt-2">
        <input type="checkbox" id="negotiable" className="w-4 h-4 text-indigo-600 rounded border-slate-300" checked={form.negotiable} onChange={(e) => setForm(prev => ({ ...prev, negotiable: e.target.checked }))} />
        <Label htmlFor="negotiable" className="font-normal cursor-pointer">Open to negotiation?</Label>
      </div>

      <div className="md:col-span-2 space-y-3 pt-4 border-t border-slate-100">
        <Label>{form.type === 'product' ? 'Product Photos (Min 2)' : 'Service Banner (Optional)'}</Label>
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
          <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
          <input
            type="file"
            accept="image/*"
            multiple
            id="file-upload"
            className="hidden"
            onChange={(e) => {
              const picked = Array.from(e.target.files || [])
              setForm(prev => ({ ...prev, files: [...prev.files, ...picked].slice(0, 6) }))
              setFormError && setFormError('')
            }}
          />
          <label htmlFor="file-upload" className="text-sm text-indigo-600 font-medium cursor-pointer hover:underline">Click to upload images</label>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
        </div>

        <div className="flex gap-3 overflow-x-auto py-2">
          {form.existingImages?.map((url, idx) => (
            <div key={`exist-${idx}`} className="relative h-20 w-20 flex-shrink-0 group">
              <img src={url} alt="existing" className="h-full w-full object-cover rounded-md border" />
              <button type="button" onClick={() => setForm(prev => ({ ...prev, existingImages: prev.existingImages.filter((_, i) => i !== idx) }))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                ✕
              </button>
            </div>
          ))}
          {form.files?.map((f, idx) => (
            <div key={`new-${idx}`} className="relative h-20 w-20 flex-shrink-0 group">
              <img src={URL.createObjectURL(f)} alt="preview" className="h-full w-full object-cover rounded-md border" />
              <button type="button" onClick={() => setForm(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                ✕
              </button>
            </div>
          ))}
        </div>
        {formError && <p className="text-red-500 text-sm font-medium">{formError}</p>}
      </div>

      <DialogFooter className="md:col-span-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {editingId ? 'Update Listing' : 'Post Listing'}
        </Button>
      </DialogFooter>
    </form>
  )
}