// Cette route est appelée par la page conversations pour lister
// toutes les conversations uniques (un client = une conversation)

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const phoneNumberId = req.nextUrl.searchParams.get('phone_number_id')
  if (!phoneNumberId) {
    return NextResponse.json({ error: 'phone_number_id requis' }, { status: 400 })
  }

  // ← Juste cette ligne protège toute la route
  const auth = await requireAuth(phoneNumberId)
  if (!auth.ok) return auth.response  // Retourne 401 ou 403 automatiquement

  // Récupère les 100 derniers messages pour identifier les conversations uniques
  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('user_phone, content, direction, created_at')
    .eq('phone_number_id', phoneNumberId)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Déduplique : garde le dernier message par user_phone (= 1 ligne par conversation)
  const seen = new Set<string>()
  const conversations = (data ?? [])
    .filter((msg) => {
      if (seen.has(msg.user_phone)) return false
      seen.add(msg.user_phone)
      return true
    })
    .map((msg) => ({
      user_phone: msg.user_phone,
      last_message: msg.content,
      last_time: msg.created_at,
      unread: false, // À implémenter avec un système de lecture
    }))

  return NextResponse.json({ conversations })
}