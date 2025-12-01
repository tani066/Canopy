"use client"

import { motion } from "framer-motion"
import { Search } from "lucide-react"

export function EmptyState({ type }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white/50 rounded-2xl border border-dashed border-slate-300"
    >
      <div className="bg-slate-100 p-4 rounded-full mb-4">
        <Search className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700">No {type} found</h3>
      <p className="text-slate-500 text-sm max-w-sm mt-1">
        Be the first to list a {type === "product" ? "product" : "service"} in this college community!
      </p>
    </motion.div>
  )
}