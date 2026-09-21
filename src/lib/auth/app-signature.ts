/**
 * Signs login requests so the backend can identify this app (defense-in-
 * depth only — a secret shipped in browser JS isn't remotely secret, so this
 * is not the actual security boundary; server-side role checks are).
 *
 * The secret is provided at build time via NEXT_PUBLIC_APP_SIGNING_SECRET
 * (must match the backend's APP_SIGNING_SECRET_DASHBOARD). Until that's
 * configured, this returns no headers and the backend treats the request
 * exactly like it does today — safe to ship before the secret is wired up.
 */
const APP_ID = 'dashboard'

export async function appSignatureHeaders(): Promise<Record<string, string>> {
  const secret = process.env.NEXT_PUBLIC_APP_SIGNING_SECRET
  if (!secret || typeof window === 'undefined' || !window.crypto?.subtle) return {}

  const timestamp = Date.now().toString()
  const enc = new TextEncoder()
  const key = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sigBuffer = await window.crypto.subtle.sign('HMAC', key, enc.encode(`${APP_ID}:${timestamp}`))
  const signature = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return {
    'X-App-Id': APP_ID,
    'X-App-Timestamp': timestamp,
    'X-App-Signature': signature,
  }
}
