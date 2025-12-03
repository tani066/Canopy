"use client"

import { motion } from "framer-motion"
import { IndianRupee, Image as ImageIcon, ShoppingBag, Briefcase, Edit, Trash2, Tag } from "lucide-react"
import Carousel from "@/components/ui/carousal"
import WhatsAppButton from "@/components/ui/whatsappButton"
import { Button } from "@/components/ui/button"

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
}

export function ListingCard({ item, type, isMine, onEdit, onDelete, onClick }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
        {type === "product" ? (
          <Carousel
            images={item.images && item.images.length ? item.images : item.imageUrl ? [item.imageUrl] : []}
            height="100%"
            className="h-full w-full object-cover"
          />
        ) : item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}

        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
            {type === "product" ? <ShoppingBag className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
            {item.category || "General"}
          </span>
          {item.negotiable && (
            <span className="bg-emerald-500/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">Negotiable</span>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
          {typeof item.price === "number" && (
            <div className="text-right">
              <div className="text-lg font-bold text-slate-900 flex items-center justify-end">
                <IndianRupee className="w-4 h-4" />
                {item.price}
              </div>
              {type === "product" && typeof item.originalPrice === "number" && (
                <div className="text-xs text-slate-400 line-through">₹{item.originalPrice}</div>
              )}
            </div>
          )}
        </div>

        <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">{item.description}</p>

        {type === "product" && item.condition && (
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg">
            <Tag className="w-3 h-3" /> Condition: <span className="font-medium text-slate-700">{item.condition}</span>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
              {item.user?.name?.charAt(0) || "U"}
            </div>
            <span className="text-xs text-slate-500 truncate max-w-[100px]">{item.user?.name}</span>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {item.contactPhone && <WhatsAppButton phone={item.contactPhone} productName={item.title} type={type} compact className="shadow" />}
            {isMine && (
              <div className="flex gap-1 ml-2 border-l pl-2 border-slate-200">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50" onClick={(e) => { e.stopPropagation(); onEdit(item) }}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
