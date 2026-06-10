'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { API_BASE_URL } from '@/services/api'
import {
  Bell,
  Users,
  Store,
  Globe,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  Megaphone,
} from 'lucide-react'

type Target = 'clients' | 'providers' | 'both'

interface BroadcastResult {
  sent: number
  failed: number
}

const TARGET_OPTIONS: { value: Target; label: string; description: string; icon: React.ReactNode; color: string; bg: string }[] = [
  {
    value: 'clients',
    label: 'Clients',
    description: 'Envoyer aux utilisateurs de l\'application client',
    icon: <Users className="w-6 h-6" />,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  },
  {
    value: 'providers',
    label: 'Prestataires',
    description: 'Envoyer aux prestataires de services (salons)',
    icon: <Store className="w-6 h-6" />,
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
  },
  {
    value: 'both',
    label: 'Tous',
    description: 'Envoyer à tous les utilisateurs et prestataires',
    icon: <Globe className="w-6 h-6" />,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  },
]

export default function NotificationsPage() {
  const [target, setTarget] = useState<Target>('clients')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BroadcastResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setError('Le titre et le message sont requis.')
      return
    }

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ikigai_token') : null
      const res = await fetch(`${API_BASE_URL}/notifications/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ target, title: title.trim(), message: message.trim() }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `Erreur ${res.status}`)
      }

      const data: BroadcastResult = await res.json()
      setResult(data)
      setTitle('')
      setMessage('')
    } catch (e: any) {
      setError(e.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  const selectedOption = TARGET_OPTIONS.find((o) => o.value === target)!

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl shadow-lg">
            <Megaphone className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications Push</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Envoyez des notifications ciblées à vos utilisateurs
            </p>
          </div>
        </div>

        {/* Target selection */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            1. Choisir les destinataires
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TARGET_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTarget(opt.value)}
                className={`flex flex-col items-start gap-3 p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                  target === opt.value
                    ? `${opt.bg} border-current ${opt.color} shadow-md scale-[1.02]`
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    target === opt.value
                      ? 'bg-white/60 dark:bg-black/20'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  <span className={target === opt.value ? opt.color : 'text-gray-500'}>{opt.icon}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
                {target === opt.value && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/30 ${opt.color}`}>
                    Sélectionné
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Message form */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            2. Rédiger le message
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Titre de la notification *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Offre spéciale ce week-end !"
                maxLength={100}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrivez ici le contenu de votre notification..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none resize-none transition"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/500</p>
            </div>

            {/* Preview */}
            {(title || message) && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" /> Aperçu
                </p>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {title || 'Titre de la notification'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      {message || 'Contenu du message...'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Success result */}
        {result && (
          <div className="flex items-start gap-4 p-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-400">Notifications envoyées !</p>
              <p className="text-sm text-green-600 dark:text-green-500 mt-0.5">
                <span className="font-bold">{result.sent}</span> envoyée{result.sent !== 1 ? 's' : ''} avec succès
                {result.failed > 0 && (
                  <span className="ml-2 text-orange-500">· {result.failed} échouée{result.failed !== 1 ? 's' : ''}</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Send button */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Destinataires :{' '}
            <span className={`font-semibold ${selectedOption.color}`}>
              {selectedOption.label}
            </span>
          </p>
          <button
            onClick={handleSend}
            disabled={loading || !title.trim() || !message.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md transition-all duration-200 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Envoyer la notification
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
