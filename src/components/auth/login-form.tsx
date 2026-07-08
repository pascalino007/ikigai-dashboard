'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Lock, Mail, AlertCircle, Moon, Sun, KeyRound, ArrowLeft } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import { ForgotPasswordModal } from './forgot-password-modal'

const RESEND_COOLDOWN_S = 30

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showForgotModal, setShowForgotModal] = useState(false)
  // Two-step login: credentials first, then the OTP emailed by the backend
  // (the backend skips the OTP step entirely for trusted devices).
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [otp, setOtp] = useState('')
  const [rememberDevice, setRememberDevice] = useState(true)
  const [info, setInfo] = useState('')
  const [resendIn, setResendIn] = useState(0)
  const { requestLoginOtp, verifyLoginOtp, isLoading, user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      if (user.role === 'enroller') {
        router.push('/enrolled-shops')
      } else if (user.role === 'admin' || user.role === 'manager' || user.role === 'designer') {
        router.push('/')
      } else {
        setError('Access denied. You do not have permission to access the dashboard.')
        logout()
      }
    }
  }, [user, router, logout])

  // Resend countdown for the OTP step.
  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  const sendOtp = async () => {
    const result = await requestLoginOtp(email, password)
    if (!result.success) {
      setError(result.error || 'Invalid email or password')
      return
    }
    if (result.otpRequired) {
      // OTP emailed — move to (or stay on) the code step.
      setStep('otp')
      setOtp('')
      setInfo(result.message || 'Un code de connexion a été envoyé à votre email')
      setResendIn(RESEND_COOLDOWN_S)
    }
    // otpRequired === false → trusted device, session already opened;
    // the `user` effect above handles the redirect.
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    await sendOtp()
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const code = otp.trim()
    if (!/^\d{4,8}$/.test(code)) {
      setError('Entrez le code reçu par email')
      return
    }

    const result = await verifyLoginOtp(email, code, rememberDevice)
    if (!result.success) {
      setError(result.error || 'Code invalide ou expiré')
    }
    // Success: the `user` effect above redirects by role.
  }

  const backToCredentials = () => {
    setStep('credentials')
    setOtp('')
    setError('')
    setInfo('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 relative">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-ikigai-primary rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">I</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Sign in to Ikigai Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Access your beauty services management platform
          </p>
        </div>
        
        {step === 'otp' ? (
        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div className="rounded-md bg-blue-50 dark:bg-blue-950/50 p-4 border border-blue-200 dark:border-blue-900">
            <div className="flex">
              <KeyRound className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <p className="ml-3 text-sm text-blue-800 dark:text-blue-300">
                {info || 'Un code de connexion a été envoyé à votre email'}
                <span className="block mt-1 font-medium">{email}</span>
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Code de vérification
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                autoFocus
                required
                className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-ikigai-primary focus:border-ikigai-primary focus:z-10 sm:text-sm tracking-[0.4em] text-center font-mono text-lg"
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="h-4 w-4 text-ikigai-primary border-gray-300 rounded"
            />
            Faire confiance à cet appareil pendant 30 jours (pas de code la prochaine fois)
          </label>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/50 p-4 border border-red-200 dark:border-red-900">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-ikigai-primary hover:bg-ikigai-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ikigai-primary disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Vérification...
              </div>
            ) : (
              'Vérifier le code'
            )}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={backToCredentials}
              className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            <button
              type="button"
              onClick={() => { setError(''); sendOtp() }}
              disabled={isLoading || resendIn > 0}
              className="text-ikigai-primary hover:text-ikigai-secondary font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendIn > 0 ? `Renvoyer le code (${resendIn}s)` : 'Renvoyer le code'}
            </button>
          </div>
        </form>
        ) : (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-ikigai-primary focus:border-ikigai-primary focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-md relative block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-ikigai-primary focus:border-ikigai-primary focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-sm text-ikigai-primary hover:text-ikigai-secondary font-medium"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/50 p-4 border border-red-200 dark:border-red-900">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-ikigai-primary hover:bg-ikigai-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ikigai-primary disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </Button>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium mb-3">Demo Credentials:</p>
               <div className="space-y-2 text-left">
                <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                  <p className="font-semibold text-blue-800 dark:text-blue-300">Admin (Full Access)</p>
                  <p className="text-xs">Email: erikfash@gmail.com</p>
                  <p className="text-xs">Password: 12345678</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/50 p-3 rounded-lg border border-green-100 dark:border-green-900">
                  <p className="font-semibold text-green-800 dark:text-green-300">Manager (Shops & Services)</p>
                  <p className="text-xs">Email: myikigai2025@gmail.com</p>
                  <p className="text-xs">Password: 12345678</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/50 p-3 rounded-lg border border-purple-100 dark:border-purple-900">
                  <p className="font-semibold text-purple-800 dark:text-purple-300">Enroller (Register Shops)</p>
                  <p className="text-xs">Email: edolire@gmail.com</p>
                  <p className="text-xs">Password: 12345678</p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-x-2">
               <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEmail('erikfash@gmail.com')
                  setPassword('12345678')
                }}
                className="text-xs"
              >
                Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEmail('myikigai2025@gmail.com')
                  setPassword('12345678')
                }}
                className="text-xs"
              >
                Manager
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEmail('edolire@gmail.com')
                  setPassword('12345678')
                }}
                className="text-xs"
              >
                Enroller
              </Button>
            </div>
          </div>
        </form>
        )}
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  )
}
