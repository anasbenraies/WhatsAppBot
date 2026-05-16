// app/auth/confirm/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (token_hash && type) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) { return cookieStore.get(name)?.value },
          set(name, value, options) { cookieStore.set(name, value, options) },
          remove(name, options) { cookieStore.set(name, '', options) },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({ 
      token_hash, 
      type: type as any 
    })
    
    if (!error) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Token invalide ou expiré
  return NextResponse.redirect(new URL('/auth/login?error=invalid_link', request.url))
}

/*
User clique le lien dans l'email
        ↓
GET /auth/confirm?token_hash=xxx&type=signup
        ↓
verifyOtp() échange le token contre une session JWT
        ↓
Supabase appelle cookies.set() → JWT écrit dans la réponse HTTP
        ↓
NextResponse.redirect('/dashboard')
        ↓
Navigateur reçoit les cookies + suit la redirection
        ↓
/dashboard — middleware lit les cookies → user authentifié ✅
*/