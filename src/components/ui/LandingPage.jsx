"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, Building2, ChevronRight, Loader2, ArrowRight } from 'lucide-react'
// Ensure this component exists in your project, or the page will break
import LiquidEther from './Liquidether'

// --- Utility Components ---
const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm backdrop-blur-sm">
    <Sparkles className="w-3 h-3" />
    {children}
  </span>
)

export default function LandingPage() {
  const [step, setStep] = useState('intro') // 'intro' | 'search'
  const [collegeQuery, setCollegeQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  const searchRef = useRef(null)
  const router = useRouter()

  // --- Auth Check ---
  useEffect(() => {
    async function check() {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (data?.ok && data.user?.collegeName) {
          const encoded = encodeURIComponent(data.user.collegeName)
          router.replace(`/college/${encoded}/dashboard`)
        }
      } catch (e) {}
    }
    check()
  }, [router])

  // --- Search Logic ---
  useEffect(() => {
    const controller = new AbortController()
    const q = collegeQuery.trim()
    
    async function fetchSuggestions() {
      if (step !== 'search' || q.length < 1) {
        setSuggestions([])
        return
      }
      try {
        setLoading(true)
        const res = await fetch(`/api/colleges?query=${encodeURIComponent(q)}&limit=5`, { signal: controller.signal })
        const data = await res.json()
        const list = Array.isArray(data.results)
          ? data.results.map(item => (typeof item === 'string' ? { name: item } : item))
          : []
        setSuggestions(list)
      } catch (e) {
        if (e.name !== 'AbortError') setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300) // Debounce
    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [collegeQuery, step])

  // --- Handlers ---
  function handleSearch() {
    if (!selectedCollege) return
    const encoded = encodeURIComponent(selectedCollege.name)
    router.push(`/college/${encoded}/login`)
  }

  const handleSelect = (s) => {
    setSelectedCollege(s)
    setCollegeQuery(s.name)
    setSuggestions([])
  }

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* 1. Background Layer */}
      <div className="absolute inset-0 z-0">
        <LiquidEther
          colors={['#4F46E5', '#C026D3', '#8B5CF6']} // Indigo, Fuchsia, Violet
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.4}
          autoIntensity={1.8}
          style={{ width: '100%', height: '100%' }}
        />
        {/* Dark Gradient Overlay for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-slate-900/60 pointer-events-none" />
        {/* Noise Texture for Polish */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      </div>

      {/* 2. Navigation */}
      <header className="relative z-20 w-full pt-6 px-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Canopy</span>
          </div>
          <button className="text-sm font-medium text-white/90 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md px-5 py-2.5 rounded-full transition-all duration-300">
            Sign In
          </button>
        </nav>
      </header>

      {/* 3. Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4">
        
        {/* Headings */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-6">
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-sm"
          >
            Connect, Learn & <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">Earn Together.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-indigo-100/90 max-w-2xl mx-auto leading-relaxed"
          >
            The exclusive platform to offer services, sell products, and network with peers within your specific college campus.
          </motion.p>
        </div>

        {/* Interaction Card */}
        <div className="w-full max-w-md h-[180px] relative perspective-1000">
            <AnimatePresence mode="wait">
                
                {/* STATE 1: INTRO BUTTON */}
                {step === 'intro' && (
                    <motion.div
                        key="intro-btn"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="absolute inset-0 flex items-start justify-center"
                    >
                        <button
                            onClick={() => setStep('search')}
                            className="group relative inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-full text-lg font-semibold shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300"
                        >
                            Find Your College
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center group-hover:bg-indigo-700 transition-colors">
                                <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                        </button>
                    </motion.div>
                )}

                {/* STATE 2: SEARCH INPUT */}
                {step === 'search' && (
                    <motion.div
                        key="search-box"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="w-full"
                    >
                        <div 
                          ref={searchRef}
                          className={`
                            bg-white rounded-2xl shadow-2xl shadow-indigo-900/20 p-2 
                            transition-all duration-300 border
                            ${isFocused ? 'ring-4 ring-indigo-500/20 border-indigo-500/50' : 'border-white/10'}
                          `}
                        >
                            <div className="relative">
                                <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search e.g. IIT Delhi..."
                                    value={collegeQuery}
                                    onChange={(e) => { 
                                      setCollegeQuery(e.target.value)
                                      setSelectedCollege(null) 
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-colors font-medium"
                                />
                                {loading && (
                                  <div className="absolute right-4 top-3.5">
                                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                                  </div>
                                )}
                            </div>

                            {/* Dropdown Results */}
                            <AnimatePresence>
                                {(suggestions.length > 0) && (
                                    <motion.div 
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-2 px-1 max-h-60 overflow-y-auto custom-scrollbar"
                                    >
                                        {suggestions.map((s, idx) => (
                                            <button
                                                key={`${s.name}-${idx}`}
                                                onClick={() => handleSelect(s)}
                                                className="w-full text-left px-4 py-3 hover:bg-indigo-50 rounded-xl transition-colors flex items-center justify-between group"
                                            >
                                                <div>
                                                    <span className="block font-medium text-slate-700 group-hover:text-indigo-700">{s.name}</span>
                                                    {s.domain && <span className="text-xs text-slate-400 font-mono">@{s.domain}</span>}
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            {/* Action Button */}
                            <button
                                onClick={handleSearch}
                                disabled={!selectedCollege}
                                className={`
                                    w-full mt-2 py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2
                                    ${selectedCollege 
                                        ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-[0.98] cursor-pointer' 
                                        : 'bg-slate-300 cursor-not-allowed opacity-70'}
                                `}
                            >
                                Continue to Dashboard
                                {selectedCollege && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>
                        
                        <div className="text-center mt-4">
                            <button 
                                onClick={() => setStep('intro')} 
                                className="text-indigo-100 hover:text-white text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

      </main>

      {/* Footer Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none z-0" />
    </div>
  )
}