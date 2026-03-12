// Ce fichier est exécuté par Next.js sur CHAQUE requête
// Il redirige vers /auth/login si l'utilisateur n'est pas connecté

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  // Créer un client Supabase avec accès aux cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Rafraîchir la session si elle existe (renouvelle le JWT automatiquement)
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // ── Règles de redirection ─────────────────────────────────
  // Si l'utilisateur tente d'accéder au dashboard sans être connecté
//   if ((pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding') ) && !session) {
if ((pathname.startsWith('/test') || pathname.startsWith('/test') ) && !session) {
  const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname) // Pour rediriger après login
    return NextResponse.redirect(loginUrl)
  }

  // Si l'utilisateur est déjà connecté et tente d'aller sur login/register
  if ((pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

// Définir sur quelles routes le middleware s'applique
export const config = {
  matcher: [
    '/dashboard/:path*',   // Toutes les pages dashboard
    '/auth/:path*',        // Pages de connexion/inscription
    '/onboarding/:path*', // Pages d'onboarding (après le signup)
    '/api/catalogue/:path*', // API Routes protégées
    '/api/conversations/:path*',
  ],
}