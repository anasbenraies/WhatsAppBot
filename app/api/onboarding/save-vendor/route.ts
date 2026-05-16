// Sauvegarde le vendeur en base de données après le signup Meta
// C'est la dernière étape de l'onboarding

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getPhoneNumberInfo } from '@/lib/meta'
import { requireAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { phoneNumberId, wabaId, shopName } = await req.json()

    // Validation basique
    if (!phoneNumberId || !wabaId) {
      return NextResponse.json(
        { success: false, error: 'Données Meta manquantes' },
        { status: 400 }
      )
    }

    // ← Juste cette ligne protège toute la route
  const auth = await requireAuth(phoneNumberId)
  if (!auth.ok) return auth.response  // Retourne 401 ou 403 automatiquement

    // Récupérer les infos du numéro (pour confirmer que tout est OK)
    const phoneInfo = await getPhoneNumberInfo(phoneNumberId)

    // Sauvegarder le vendeur en BDD
    // upsert = insert si n'existe pas, update si existe déjà
    const { error } = await supabaseAdmin
      .from('vendors')
      .upsert({
        phone_number_id: phoneNumberId,
        waba_id: wabaId,
        shop_name: shopName || phoneInfo.verified_name || 'Ma Boutique',
        status: 'active',
        plan: 'starter',
      })

    if (error) throw new Error(error.message)

    console.log(`✅ Nouveau vendeur enregistré : ${phoneNumberId}`)

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Erreur save-vendor:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}