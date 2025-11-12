"use client"

import React, { useState } from 'react'

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('services')
  const [showCollegeInput, setShowCollegeInput] = useState(false)

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {/* Enhanced Logo */}
              <div className="w-12 h-12 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  <path d="M6 8a2 2 0 11-4 0 2 2 0 014 0zM4 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
            <button className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition duration-200">
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
            <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Earn
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The ultimate student marketplace where you can offer services, sell products, 
            and connect with peers in your local area. From tutoring to event management, 
            digital marketing to handmade crafts - everything in one place.
          </p>
          
          {/* College Input (hidden until Get Started click) */}
          <div className="max-w-md mx-auto mb-12 overflow-hidden">
            <div
              className={`transform transition-transform duration-500 ease-out ${
                showCollegeInput ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <input
                type="text"
                placeholder="Enter your college name"
                className="w-full px-4 py-3 rounded-lg border-0 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-lg cursor-pointer"
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