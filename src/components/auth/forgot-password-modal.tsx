'use client'

import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/services/api'
import { Button } from '@/components/ui/button'
import { X, Mail, KeyRound, Lock, ArrowLeft, CheckCircle } from 'lucide-react'

const RESEND_COOLDOWN_S = 30

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'email' | 'otp' | 'password' | 'success'

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  const resetAll = () => {
    setStep('email')
    setEmail('')
    setOtp('')
    setResetToken('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setDevOtp('')
    setResendIn(0)
  }

  const handleClose = () => {
    resetAll()
    onClose()
  }

  const requestOtp = async () => {
    setError('')
    if (!email) {
      setError('Please enter your email')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Failed to send OTP')
        return
      }
      if (data.devOtp) {
        setDevOtp(data.devOtp)
      }
      setStep('otp')
      setResendIn(RESEND_COOLDOWN_S)
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    await requestOtp()
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!otp) {
      setError('Please enter the OTP code')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Invalid OTP')
        return
      }
      setResetToken(data.resetToken)
      setStep('password')
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both fields')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password-with-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Failed to reset password')
        return
      }
      setStep('success')
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {step === 'email' && 'Reset Password'}
              {step === 'otp' && 'Enter Verification Code'}
              {step === 'password' && 'Create New Password'}
              {step === 'success' && 'All Set!'}
            </h2>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your email and we&apos;ll send you a verification code to reset your password.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-ikigai-primary focus:border-ikigai-primary sm:text-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Sending...' : 'Send verification code'}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We sent a 6-digit code to <span className="font-medium">{email}</span>
              </p>

              {devOtp && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-md p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Development OTP (non-prod only):</p>
                  <p className="text-lg font-mono font-bold text-blue-800 dark:text-blue-200 tracking-widest">{devOtp}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Verification code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-ikigai-primary focus:border-ikigai-primary text-center font-mono text-lg tracking-[0.4em]"
                    placeholder="••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setStep('email'); setError(''); setOtp('') }}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setError(''); requestOtp() }}
                  disabled={loading || resendIn > 0}
                  className="text-sm text-ikigai-primary hover:text-ikigai-secondary font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendIn > 0 ? `Resend code (${resendIn}s)` : "Didn't get it? Resend code"}
                </button>
              </div>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create a new password for your account.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-ikigai-primary focus:border-ikigai-primary sm:text-sm"
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-ikigai-primary focus:border-ikigai-primary sm:text-sm"
                    placeholder="Repeat password"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Updating...' : 'Reset password'}
              </Button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Password updated!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <Button onClick={handleClose} className="w-full">
                Back to login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
