import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Middleware temporarily disabled to fix authentication issues
  // Will be re-enabled once client-side authentication is working properly
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Temporarily disabled middleware to fix login issue
     * Will re-enable once authentication is working properly
     */
    // '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
