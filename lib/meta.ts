// Fonctions utilitaires pour appeler l'API Meta Graph

const META_API = 'https://graph.facebook.com/v19.0'
const TOKEN = process.env.META_SYSTEM_USER_TOKEN!

/**
 * Échange le code Embedded Signup contre un token d'accès permanent
 * Meta te donne un code éphémère lors du signup → tu l'échanges contre un vrai token
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
  const url = new URL(`${META_API}/oauth/access_token`)
  url.searchParams.set('client_id', process.env.NEXT_PUBLIC_META_APP_ID!)
  url.searchParams.set('client_secret', process.env.META_APP_SECRET!)
  url.searchParams.set('code', code)

  const res = await fetch(url.toString())
  const data = await res.json()

  if (data.error) throw new Error(data.error.message)
  return data.access_token
}

/**
 * Récupère les informations d'un numéro WhatsApp Business
 * Retourne le numéro formaté, le statut, la qualité du compte
 */
export async function getPhoneNumberInfo(phoneNumberId: string) {
  const res = await fetch(
    `${META_API}/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  )
  return res.json()
}
