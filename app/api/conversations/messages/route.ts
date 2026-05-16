// Retourne tous les messages d'une conversation spécifique
// client (user_phone) ↔ vendeur (phone_number_id)

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const phoneNumberId = req.nextUrl.searchParams.get('phone_number_id')
  const userPhone     = req.nextUrl.searchParams.get('user_phone')

  if (!phoneNumberId || !userPhone) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  // ← Juste cette ligne protège toute la route
  const auth = await requireAuth(phoneNumberId)
  if (!auth.ok) return auth.response  // Retourne 401 ou 403 automatiquement

  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('phone_number_id', phoneNumberId)
    .eq('user_phone', userPhone)
    .order('created_at', { ascending: true }) // Ordre chronologique pour l'affichage

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ messages: data ?? [] })
}