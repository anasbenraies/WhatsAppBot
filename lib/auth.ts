// Ce helper est appelé au début de CHAQUE API Route protégée
// Il vérifie que l'utilisateur est connecté ET qu'il possède le phone_number_id

import { createSupabaseServerClient, supabaseAdmin } from './supabase'
import { NextResponse } from 'next/server'

export type AuthResult =
  | { ok: true;  userId: string; phoneNumberId: string }
  | { ok: false; response: NextResponse }

/**
 * Vérifie :
 * 1. L'utilisateur est connecté (JWT valide dans les cookies)
 * 2. Le phone_number_id appartient bien à cet utilisateur
 *
 * Usage dans une API Route :
 *   const auth = await requireAuth(phoneNumberId)
 *   if (!auth.ok) return auth.response
 *   // Ici tu es sûr que l'utilisateur est légitime
 */
export async function requireAuth(phoneNumberId: string): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient()

  // 1. Vérifier la session (JWT dans les cookies)
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Non authentifié — connecte-toi pour accéder à cette ressource' },
        { status: 401 }
      ),
    }
  }

  const userId = session.user.id

  // 2. Vérifier que ce phoneNumberId appartient à cet userId
  //    Un vendeur ne peut accéder qu'à SES propres données
  const { data: vendor } = await supabaseAdmin
    .from('vendors')
    .select('id')
    .eq('phone_number_id', phoneNumberId)
    .eq('user_id', userId)   // ← La clé : on vérifie la propriété
    .single()

  if (!vendor) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Accès refusé — ce numéro ne t\'appartient pas' },
        { status: 403 }
      ),
    }
  }

  return { ok: true, userId, phoneNumberId }
}

/**
 * Version simple : vérifie juste la session sans vérifier le phoneNumberId
 * Utile pour des routes comme GET /api/me
 */
export async function getSession() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}