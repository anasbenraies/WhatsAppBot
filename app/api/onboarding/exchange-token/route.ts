// Échange le code temporaire Meta contre un token d'accès permanent
// Ce token permettra à l'agent d'envoyer des messages au nom du vendeur

import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken } from '@/lib/meta'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code manquant' },
        { status: 400 }
      )
    }

    // Appel Meta API pour échanger le code → token
    const accessToken = await exchangeCodeForToken(code)

    // Stocker le token temporairement en cookie sécurisé
    // Il sera utilisé dans save-vendor pour être sauvegardé en BDD
    const response = NextResponse.json({ success: true })
    response.cookies.set('meta_temp_token', accessToken, {
      httpOnly: true,     // Inaccessible depuis JS côté client
      secure: true,       // HTTPS uniquement
      maxAge: 300,        // Expire dans 5 minutes
      sameSite: 'strict',
    })

    return response

  } catch (error: any) {
    console.error('Erreur exchange-token:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}