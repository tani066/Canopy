"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function CollegeLoginPage() {
  const { name: collegeNameParam } = useParams()
  const router = useRouter()
  const collegeName = decodeURIComponent(collegeNameParam || '')
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
          setError('College not found in CSV. Please select from suggestions.')
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
    if (!otp || !email) {
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
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Login - {collegeName}</h1>
        {college?.domain && (
          <p className="text-sm text-gray-600 mb-6">Use your college email ending with @{college.domain}</p>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {step === 'enter' || step === 'sending' ? (
          <form onSubmit={handleSendOtp} className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">College Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none"
                placeholder={`name@${college?.domain || 'yourcollege.edu'}`}
              />
            </div>
            <button
              type="submit"
              disabled={step === 'sending'}
              className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
            >
              {step === 'sending' ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        ) : null}

        {step === 'sent' || step === 'verifying' ? (
          <form onSubmit={handleVerifyOtp} className="mt-6 bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">We&apos;ve sent a 6-digit OTP to {email}</p>
              {remainingSeconds > 0 && (
                <span className="text-sm font-medium text-gray-900">
                  Expires in {String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}
                  :{String(remainingSeconds % 60).padStart(2, '0')}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none"
                placeholder="6-digit code"
              />
            </div>
            <button
              type="submit"
              disabled={step === 'verifying' || remainingSeconds <= 0}
              className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
            >
              {step === 'verifying' ? 'Verifying…' : 'Verify OTP'}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  )
}