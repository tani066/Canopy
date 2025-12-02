"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  User, 
  KeyRound, 
  ArrowRight, 
  Loader2, 
  Building2, 
  AlertCircle, 
  CheckCircle2,
  ArrowLeft
} from 'lucide-react'
import LiquidEther from '@/components/ui/Liquidether'

export default function CollegeLoginPage() {
  const { name: collegeNameParam } = useParams()
  const router = useRouter()
  const collegeName = decodeURIComponent(collegeNameParam || '')
  
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

  const [college, setCollege] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('enter') // enter -> sending -> sent -> verifying -> done
  const [error, setError] = useState('')
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  // --- Load College Data ---
  useEffect(() => {
    async function loadCollege() {
      try {
        const res = await fetch(`/api/college?name=${encodeURIComponent(collegeName)}`)
        const data = await res.json()
        if (data.ok) {
          setCollege(data.college)
        } else {
          setCollege(null)
        }
      } catch (e) {
        setCollege(null)
      }
    }
    if (collegeName) loadCollege()
  }, [collegeName])

  // --- Handlers ---
  async function handleSendOtp(e) {
    e.preventDefault()
    setError('')
    if (!name || !email) {
      setError('Please enter your name and email.')
      return
    }
    try {
      setStep('sending')
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeName, name, email })
      })
      const data = await res.json()
      if (!data.ok) {
        if (data.error === 'email_domain_invalid' && data.domain) {
          setError(`Email must end with @${data.domain}`)
        } else if (data.error === 'college_not_found') {
          setError('College not found. Please select from search.')
        } else {
          setError('Could not send OTP. Please try again.')
        }
        setStep('enter')
        return
      }
      setStep('sent')
      setRemainingSeconds(300)
    } catch (e) {
      setError('Network error. Please try again.')
      setStep('enter')
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError('')
    if (!otp) {
      setError('Enter the OTP sent to your email.')
      return
    }
    try {
      setStep('verifying')
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      const data = await res.json()
      if (!data.ok) {
        if (data.error === 'otp_invalid') setError('Invalid OTP. Please try again.')
        else if (data.error === 'otp_expired') setError('OTP expired. Request a new one.')
        else setError('Verification failed. Please try again.')
        setStep('sent')
        return
      }
      setStep('done')
      const encoded = encodeURIComponent(collegeName)
      router.replace(`/college/${encoded}/dashboard`)
    } catch (e) {
      setError('Network error. Please try again.')
      setStep('sent')
    }
  }

  // --- Timer ---
  useEffect(() => {
    if (step !== 'sent' && step !== 'verifying') return
    if (remainingSeconds <= 0) return
    const timer = setInterval(() => {
      setRemainingSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer)
          setError('OTP expired. Request a new one.')
          setStep('enter')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [step, remainingSeconds])

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans flex items-center justify-center p-4">
      
      {/* 1. Background Layer (Same as Landing) */}
      <div className="absolute inset-0 z-0">
        <LiquidEther
          colors={['#4F46E5', '#C026D3', '#8B5CF6']}
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
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900/70 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      </div>

      {/* 2. Glass Card Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
          
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-white/10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur shadow-inner mb-4">
               <Building2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{collegeName}</h1>
            {college?.domain && (
               <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-100 border border-indigo-500/30">
                 Student Login
               </div>
            )}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* ERROR MESSAGE */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-200 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-100">{error}</p>
                </motion.div>
              )}

              {/* STEP 1: ENTER DETAILS */}
              {(step === 'enter' || step === 'sending') && (
                <motion.form
                  key="form-details"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSendOtp}
                  className="space-y-5"
                >
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-200 ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-white transition-colors" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full bg-slate-900/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-200 ml-1">College Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-white transition-colors" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={`student@${college?.domain || 'college.edu'}`}
                          className="w-full bg-slate-900/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                        />
                      </div>
                      {college?.domain && <p className="text-xs text-slate-200 ml-1">Must end with @{college.domain}</p>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={step === 'sending'}
                    className="w-full group relative flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                  >
                    {step === 'sending' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => router.push('/')}
                    className="w-full text-center text-sm text-slate-200 hover:text-white transition-colors mt-4"
                  >
                    Not your college? Go back
                  </button>
                </motion.form>
              )}

              {/* STEP 2: VERIFY OTP */}
              {(step === 'sent' || step === 'verifying' || step === 'done') && (
                <motion.form
                  key="form-otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-6"
                >
                  <div className="text-center space-y-1">
                    <div className="bg-emerald-500/20 text-emerald-200 w-fit mx-auto px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/30 flex items-center gap-1">
                       <CheckCircle2 className="w-3 h-3" /> OTP Sent
                    </div>
                    <p className="text-sm text-white">
                      We sent a 6-digit code to <br/>
                      <span className="font-semibold text-white">{email}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                      <label className="font-medium text-slate-200 ml-1">Enter Verification Code</label>
                      <div className="relative group">
                        <KeyRound className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-white transition-colors" />
                        <input
                          type="text"
                          inputMode="numeric"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="000000"
                          maxLength={6}
                          className="w-full bg-slate-900/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-lg tracking-widest placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono"
                        />
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <button 
                            type="button" 
                            onClick={() => { setStep('enter'); setError(''); }}
                            className=" text-slate-200 hover:text-white flex items-center gap-1"
                        >
                            <ArrowLeft className="w-3 h-3" /> Change email
                        </button>
                        {remainingSeconds > 0 && (
                            <span className=" text-slate-200 font-mono">
                                Expires in {String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:{String(remainingSeconds % 60).padStart(2, '0')}
                            </span>
                        )}
                      </div>
                  </div>

                  <button
                    type="submit"
                    disabled={step === 'verifying' || remainingSeconds <= 0}
                    className="w-full group relative flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                  >
                    {step === 'verifying' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Login'
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Footer info */}
        <p className="text-center text-slate-200 text-xs mt-6">
          Protected by secure email verification.
        </p>
      </motion.div>
    </div>
  )
}