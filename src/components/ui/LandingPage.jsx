"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
const LandingPage = () => {
  const [showCollegeInput, setShowCollegeInput] = useState(false)
  const [collegeQuery, setCollegeQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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

  useEffect(() => {
    const controller = new AbortController()
    const q = collegeQuery.trim()
    async function fetchSuggestions() {
      if (!showCollegeInput || q.length < 2) {
        setSuggestions([])
        return
      }
      try {
        setLoading(true)
        const res = await fetch(`/api/colleges?query=${encodeURIComponent(q)}&limit=8`, { signal: controller.signal })
        const data = await res.json()
        const list = Array.isArray(data.results)
          ? data.results.map(item => (typeof item === 'string' ? { name: item } : item))
          : []
        setSuggestions(list)
      } catch (e) {
        if (e.name !== 'AbortError') {
          setSuggestions([])
        }
      } finally {
        setLoading(false)
      }
    }
    fetchSuggestions()
    return () => controller.abort()
  }, [collegeQuery, showCollegeInput])

  function handleSearch() {
    // Enforce selection from suggestions
    const name = selectedCollege?.name
    if (!name) return
    const encoded = encodeURIComponent(name)
    router.push(`/college/${encoded}/login`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {/* Enhanced Logo */}
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  <path d="M6 8a2 2 0 11-4 0 2 2 0 014 0zM4 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Canopy
                </h1>
                <p className="text-sm text-gray-500">Student Marketplace</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Browse</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">How it Works</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">About</a>
            </nav>
            
            {/* Login Button */}
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition duration-200">
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect, Learn & 
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Earn
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The ultimate student marketplace where you can offer services, sell products, 
            and connect with peers in your local area. From tutoring to event management, 
            digital marketing to handmade crafts - everything in one place.
          </p>
          
          {/* College Input (hidden until Get Started click) */}
          {showCollegeInput && (
            <div className="max-w-md mx-auto mb-12">
              <div className="flex items-center">
              <div className="relative w-full">
                <Input
                  type="text"
                  value={collegeQuery}
                  onChange={(e) => { setCollegeQuery(e.target.value); setSelectedCollege(null) }}
                  placeholder="Enter your college name"
                  className="w-full px-4 py-3 rounded-lg border-0 text-gray-900 shadow-sm focus:outline-none bg-white"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch() } }}
                />
                {(suggestions.length > 0 || loading) && (
                  <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg text-left">
                    {loading && (
                      <div className="px-4 py-3 text-sm text-gray-500">Searching…</div>
                    )}
                    {!loading && suggestions.map((s, idx) => (
                      <button
                        type="button"
                        key={`${s.name}-${idx}`}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50"
                        onClick={() => { setSelectedCollege(s); setCollegeQuery(s.name) }}
                      >
                        <span className="font-medium text-gray-900">{s.name}</span>
                        {s.domain ? (
                          <span className="ml-2 text-gray-500 text-sm">@{s.domain}</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className='ml-4'>
                <button
                  onClick={handleSearch}
                  disabled={!selectedCollege}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-lg cursor-pointer disabled:opacity-60"
                >
                  Search
                </button>
              </div>
              </div>
              {!selectedCollege && (
                <p className="mt-2 text-sm text-gray-600 text-center">Please select a college from the list.</p>
              )}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-lg cursor-pointer"
              onClick={() => setShowCollegeInput(true)}
            >
              Get Started
            </button>
            
          </div>
          
        </div>
      </section>

      

      
    </div>
  )
}

export default LandingPage