import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// DEMO BUILD — the real proxy (Next.js middleware) calls @supabase/ssr's
// createServerClient against a live Supabase project to check for a real
// session cookie, server-side. That has no equivalent here: the mocked
// session in utils/supabase.ts lives only in browser memory, and there's no
// real Supabase project for the edge runtime to call. Since the demo's
// fictional user is always "logged in," this mirrors the original's route
// protection with that fixed fact instead of a real cookie check: visiting
// /login bounces to the dashboard, every other matched route is allowed.
// ---------------------------------------------------------------------------

export const proxy = async function (request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
}

export const config = {
  matcher: ['/', '/login'], // Protect specific routes
}
