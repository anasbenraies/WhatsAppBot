# 🔐 PARTIE 1 — D'où obtenir chaque variable d'environnement

---

## `nextjs-app/.env.local`

---

### `NEXT_PUBLIC_META_APP_ID`
**Où** : developers.facebook.com

1. Va sur https://developers.facebook.com
2. Clique **"Mes applications"** → **"Créer une application"**
3. Type : **Business** → donne un nom (ex: "SupportDarija")
4. Une fois créée → **l'App ID est affiché en haut à gauche** du dashboard

```
App ID : 1234567890123456  ← c'est ça
✅ Peut être exposé côté client (NEXT_PUBLIC_)
```

---

### `META_APP_SECRET`
**Où** : Même app Meta → Paramètres → Général

1. Menu gauche → **"Paramètres"** → **"Général"**
2. Section **"Clé secrète de l'application"**
3. Clique **"Afficher"** (demande ton mot de passe Facebook)

```
⚠️ Ne jamais mettre NEXT_PUBLIC_ devant — jamais côté client
```

---

### `META_SYSTEM_USER_TOKEN`
**Où** : business.facebook.com → Utilisateurs système

C'est le token permanent qui permet à ton app d'envoyer des messages WA.

1. Va sur https://business.facebook.com
2. Menu → **Paramètres** → **Paramètres du compte Business**
3. Colonne gauche → **Utilisateurs** → **Utilisateurs système**
4. Clique **"Ajouter"** → nom : "SupportDarija Bot" → type : **Admin**
5. Une fois créé → clique sur l'utilisateur → **"Générer un nouveau token"**
6. Sélectionne ton app Meta dans la liste
7. Coche ces permissions :
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
8. Clique **"Générer le token"**
9. **Copie-le immédiatement** — il n'est affiché qu'une seule fois

```
Token : EAAxxxxxxxxxxxxxxxxxxxxx...  (très long, ~200 caractères)
⚠️ Jamais côté client
```

---

### `NEXT_PUBLIC_SUPABASE_URL`
**Où** : supabase.com → ton projet → Settings → API

1. Va sur https://supabase.com → **"New Project"**
2. Choisis une région (EU West = Frankfurt, proche Tunisie)
3. Projet créé → icône ⚙️ → **"Project Settings"** → **"API"**
4. **"Project URL"** → copie-la

```
https://abcdefghijkl.supabase.co
✅ Peut être exposé (NEXT_PUBLIC_)
```

---

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Où** : Même page → section "Project API keys"

- Ligne **"anon public"** → copie la valeur

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ Peut être exposé (NEXT_PUBLIC_) — limitée par Row Level Security
```

---

### `SUPABASE_SERVICE_ROLE_KEY`
**Où** : Même page → "Project API keys"

- Ligne **"service_role"** → clique **"Reveal"** → copie

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  (différent de l'anon)
⚠️ Droits TOTAUX sur ta BDD — jamais côté client, jamais dans le git
```

---

## `agent-node/.env`

---

### `META_VERIFY_TOKEN`
**Où** : Tu l'inventes toi-même !

C'est une chaîne secrète que tu choisis. Meta te la demandera
quand tu enregistreras ton webhook pour vérifier que c'est bien toi.

```bash
# Génère un token sécurisé aléatoire :
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# → ex: a3f7c2d1e9b4...
```

Tu mets cette valeur dans ton `.env` ET dans la console Meta lors de l'enregistrement du webhook.

---

### `META_APP_SECRET`
Identique à celui de Next.js. Copie-colle la même valeur.

---

### `META_SYSTEM_USER_TOKEN`
Identique à celui de Next.js. Copie-colle la même valeur.

---

### `ANTHROPIC_API_KEY`
**Où** : console.anthropic.com

1. Va sur https://console.anthropic.com
2. Crée un compte (gratuit, pas de carte requise pour commencer)
3. Menu gauche → **"API Keys"**
4. Clique **"Create Key"** → nom : "SupportDarija"
5. **Copie immédiatement** — affiché une seule fois

```
sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxx...
Coût réel : claude-haiku ≈ $0.001 pour 10 échanges → quasi gratuit au démarrage
⚠️ Jamais côté client
```

---

### `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`
Identiques aux valeurs Next.js. Copie-colle les mêmes.

---

### `PORT`
Tu choisis : `3001` par convention (Next.js tourne sur 3000).

---

## 📋 Récapitulatif tableau

```
Variable                         Où l'obtenir                              Public ?
────────────────────────────     ────────────────────────────────────────  ────────
NEXT_PUBLIC_META_APP_ID          developers.facebook.com → dashboard app   ✅ Oui
META_APP_SECRET                  developers.facebook.com → Paramètres       ❌ Non
META_SYSTEM_USER_TOKEN           business.facebook.com → Utilisateurs sys.  ❌ Non
NEXT_PUBLIC_SUPABASE_URL         supabase.com → Settings → API             ✅ Oui
NEXT_PUBLIC_SUPABASE_ANON_KEY    supabase.com → Settings → API keys        ✅ Oui
SUPABASE_SERVICE_ROLE_KEY        supabase.com → Settings → API keys        ❌ Non
META_VERIFY_TOKEN                Tu l'inventes (random string)              ❌ Non
ANTHROPIC_API_KEY                console.anthropic.com → API Keys           ❌ Non
PORT                             Tu choisis (ex: 3001)                      —
```
# 🖥️ PARTIE 2 — Code de toutes les pages manquantes

Pages déjà fournies dans le tutoriel :
✅ lib/supabase.ts
✅ lib/meta.ts
✅ api/onboarding/exchange-token/route.ts
✅ api/onboarding/save-vendor/route.ts
✅ api/catalogue/route.ts

Pages manquantes à compléter ci-dessous :
❌ app/layout.tsx
❌ app/page.tsx                        (Landing page)
❌ app/onboarding/page.tsx             (Connexion WhatsApp)
❌ app/dashboard/page.tsx              (Dashboard principal)
❌ app/dashboard/catalogue/page.tsx    (Gestion produits)
❌ app/dashboard/conversations/page.tsx (Historique messages)
❌ components/DashboardLayout.tsx      (Layout partagé dashboard)

---

## `app/layout.tsx`

```tsx
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SupportDarija — Bot WhatsApp en Darija Tunisienne',
  description: 'Automatise ton service client WhatsApp en darija tunisienne',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${geist.className} bg-gray-50 text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

---

## `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  /* Boutons */
  .btn-primary {
    @apply bg-green-500 hover:bg-green-600 active:bg-green-700
           text-white font-semibold py-3 px-6 rounded-xl
           transition-all duration-150 disabled:opacity-40
           disabled:cursor-not-allowed inline-flex items-center justify-center gap-2;
  }
  .btn-secondary {
    @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium
           py-2.5 px-5 rounded-xl transition-all duration-150
           inline-flex items-center justify-center gap-2;
  }
  .btn-danger {
    @apply bg-red-50 hover:bg-red-100 text-red-600 font-medium
           py-2 px-4 rounded-lg transition-all duration-150;
  }

  /* Cartes */
  .card {
    @apply bg-white rounded-2xl border border-gray-100 shadow-sm p-6;
  }

  /* Input */
  .input {
    @apply w-full border border-gray-200 rounded-xl px-4 py-3
           focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent
           text-gray-800 placeholder-gray-400 bg-white transition-all;
  }
  .label {
    @apply block text-sm font-medium text-gray-700 mb-1.5;
  }

  /* Badge */
  .badge-green  { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700; }
  .badge-yellow { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700; }
  .badge-red    { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700; }
  .badge-blue   { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700; }
  .badge-gray   { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600; }
}
```

---

## `app/page.tsx` — Landing Page

```tsx
import Link from 'next/link'

export default function LandingPage() {
  const features = [
    { icon: '🗣️', title: 'Darija authentique', desc: 'Ton bot répond comme un vrai Tunisien — arabe dialectal + français naturellement mélangés.' },
    { icon: '⚡', title: 'Réponse en 1 seconde', desc: 'Zéro client qui attend. Réponse automatique 24h/24, 7j/7, même à 3h du matin.' },
    { icon: '📦', title: 'Commandes COD auto', desc: 'Collecte nom, adresse, téléphone et confirme la commande automatiquement.' },
    { icon: '📊', title: 'Dashboard analytics', desc: 'Suis tes conversations, ventes et clients en temps réel depuis un dashboard simple.' },
    { icon: '👤', title: 'Transfert humain intelligent', desc: 'Le bot gère le volume, toi tu reprends la main sur les cas complexes.' },
    { icon: '🆓', title: 'Gratuit si client écrit en premier', desc: "Zéro frais Meta dans 95% des cas — quand c'est le client qui t'écrit." },
  ]

  const plans = [
    {
      name: 'Starter',
      price: '49',
      color: 'border-gray-200',
      cta: 'btn-secondary',
      features: ['500 messages/mois', '50 produits catalogue', '1 agent humain', 'Support email 48h'],
    },
    {
      name: 'Pro',
      price: '99',
      badge: '⭐ Populaire',
      color: 'border-green-400 ring-2 ring-green-300',
      cta: 'btn-primary',
      features: ['2 000 messages/mois', '500 produits catalogue', '3 agents humains', 'Support WhatsApp 24h'],
    },
    {
      name: 'Business',
      price: '199',
      color: 'border-blue-300',
      cta: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition text-center block',
      features: ['Messages illimités', 'Catalogue illimité', 'Agents illimités', 'Support prioritaire'],
    },
  ]

  return (
    <div className="min-h-screen">

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl text-gray-900">🤖 SupportDarija</span>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Dashboard
            </Link>
            <Link href="/onboarding" className="btn-primary text-sm !py-2 !px-4">
              Commencer →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
            Bot actif pour 200+ boutiques tunisiennes
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Ton bot WhatsApp<br />
            <span className="text-green-500">parle darija</span> 🇹🇳
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Automatise ton service client WhatsApp en darija tunisienne authentique.
            Répond aux questions, prend les commandes COD, transfère les cas complexes — sans code.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding" className="btn-primary !text-lg !py-4 !px-8">
              Activer mon bot — Gratuit →
            </Link>
            <a href="#demo" className="btn-secondary !text-lg !py-4 !px-8">
              Voir la démo
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-5">
            Configuration en 5 minutes · Aucune carte bancaire requise pour débuter
          </p>
        </div>
      </section>

      {/* Démo conversation */}
      <section id="demo" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Voilà ce que voit ton client 👇
            </h2>
            <p className="text-gray-500 mb-6">
              Une vraie conversation en darija — naturelle, rapide, efficace.
              Ton bot comprend le code-switching arabe/français comme un humain.
            </p>
            <ul className="space-y-3">
              {[
                'Comprend le darija, le français, et le mélange des deux',
                'Vérifie le stock en temps réel avant de répondre',
                'Collecte les infos COD étape par étape naturellement',
                'Transfère à toi si le client dit "agent" ou "responsable"',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mock WhatsApp */}
          <div className="flex-shrink-0 w-72">
            <div className="bg-gray-900 rounded-3xl p-5 shadow-2xl">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-700">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  B
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Boutique Rania 👗</p>
                  <p className="text-green-400 text-xs">En ligne</p>
                </div>
              </div>
              <div className="space-y-2.5 text-sm">
                {[
                  { from: 'user', text: 'Salam, 3andkum blousa hamra M ?' },
                  { from: 'bot',  text: 'Salam ! Yessir 3andna 🔴 Blousa hamra taille M — 45 DT ✅. Thab taamel commande ?' },
                  { from: 'user', text: 'Ih bghit' },
                  { from: 'bot',  text: 'Behi ! 3tiini ismek please 🙏' },
                  { from: 'user', text: 'Fatma Trabelsi' },
                  { from: 'bot',  text: "Merci Fatma ! W l'adresse + wilaya mta3ek ?" },
                ].map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                      msg.from === 'user'
                        ? 'bg-green-500 text-white rounded-br-sm'
                        : 'bg-gray-700 text-gray-100 rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">
            Tout ce dont tu as besoin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="card hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Tarifs simples et transparents
          </h2>
          <p className="text-center text-gray-500 mb-14">
            En dinars tunisiens · Sans engagement · Résiliable à tout moment
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div key={i} className={`card border-2 ${plan.color} relative flex flex-col`}>
                {plan.badge && (
                  <span className="badge-green absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}
                <h3 className="font-bold text-xl text-gray-800 mb-1">{plan.name}</h3>
                <div className="mb-5">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-1 text-sm">DT/mois</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/onboarding" className={plan.cta === 'btn-primary' || plan.cta === 'btn-secondary' ? `${plan.cta} w-full` : plan.cta}>
                  Commencer
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm">🤖 SupportDarija — Fait avec ❤️ pour les boutiques tunisiennes</p>
        <p className="text-gray-600 text-xs mt-2">© {new Date().getFullYear()} SupportDarija. Tous droits réservés.</p>
      </footer>
    </div>
  )
}
```

---

## `app/onboarding/page.tsx`

```tsx
'use client'
import { useState, useEffect } from 'react'

declare const FB: any

type Step = 'intro' | 'loading' | 'done' | 'error'

const STEPS_LABELS = ['Ton boutique', 'Connexion Meta', 'Bot actif ✅']

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('intro')
  const [shopName, setShopName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Initialiser le SDK Facebook
    window.fbAsyncInit = function () {
      FB.init({ appId: process.env.NEXT_PUBLIC_META_APP_ID!, version: 'v19.0', autoLogAppEvents: true })
    }
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/fr_FR/sdk.js'
    script.async = true
    document.body.appendChild(script)

    // Écouter le retour Meta via postMessage
    // Meta envoie les IDs quand le vendeur finit le Embedded Signup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.facebook.com') return
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.event === 'FINISH') {
            // Le vendeur a terminé → on a les IDs, on sauvegarde
            saveVendor(data.data.phone_number_id, data.data.waba_id)
          }
          if (data.event === 'CANCEL') {
            setStep('intro') // Vendeur a fermé sans finir
          }
        }
      } catch {}
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [shopName])

  function launchEmbeddedSignup() {
    if (!shopName.trim()) return
    setStep('loading')

    // Ouvre le popup Facebook Embedded Signup
    // Le vendeur va connecter son compte WhatsApp Business
    FB.login(
      async (response: any) => {
        if (response.authResponse?.code) {
          // Échanger le code contre un token (sécurité OAuth)
          try {
            await fetch('/api/onboarding/exchange-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: response.authResponse.code }),
            })
          } catch {
            setStep('error')
            setErrorMsg('Erreur lors de la connexion à Meta')
          }
        } else {
          setStep('intro') // Le vendeur a annulé
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID, // Créé dans Meta Business Suite
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureName: 'whatsapp_embedded_signup',
          sessionInfoVersion: '3',
        },
      }
    )
  }

  async function saveVendor(phoneNumberId: string, wabaId: string) {
    try {
      const res = await fetch('/api/onboarding/save-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumberId, wabaId, shopName }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setStep('done')
    } catch (e: any) {
      setErrorMsg(e.message)
      setStep('error')
    }
  }

  const currentStepIndex = step === 'intro' ? 0 : step === 'loading' ? 1 : 2

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">

        {/* Header vert */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
          <div className="text-5xl mb-3">📱</div>
          <h1 className="text-2xl font-bold">Active ton bot WhatsApp</h1>
          <p className="text-green-100 text-sm mt-1">Configuration en 2 minutes · Aucun code requis</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center px-8 py-4 bg-gray-50 border-b border-gray-100">
          {STEPS_LABELS.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                i <= currentStepIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {i < currentStepIndex ? '✓' : i + 1}
              </div>
              <span className="text-xs text-gray-500 ml-1.5 hidden sm:block truncate">{label}</span>
              {i < 2 && <div className={`flex-1 h-0.5 mx-2 ${i < currentStepIndex ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="p-8">

          {/* ── STEP 1 : Intro ─────────────────────────────── */}
          {step === 'intro' && (
            <div className="space-y-5">
              <div>
                <label className="label">Nom de ta boutique</label>
                <input
                  type="text"
                  placeholder="Ex: Boutique Rania, Rania Shop..."
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="input"
                  onKeyDown={(e) => e.key === 'Enter' && launchEmbeddedSignup()}
                />
              </div>

              <button
                onClick={launchEmbeddedSignup}
                disabled={!shopName.trim()}
                className="btn-primary w-full"
              >
                🔗 Connecter mon WhatsApp Business
              </button>

              <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-700 space-y-1.5">
                <p className="font-semibold">ℹ️ Ce qui va se passer :</p>
                <p>• Un popup Facebook s'ouvre</p>
                <p>• Tu sélectionnes ton compte WhatsApp Business</p>
                <p>• Meta vérifie ton numéro automatiquement</p>
                <p>• Ton bot est activé immédiatement ✅</p>
              </div>
            </div>
          )}

          {/* ── STEP 2 : Loading ───────────────────────────── */}
          {step === 'loading' && (
            <div className="text-center py-10">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
              <p className="text-gray-700 font-semibold">Connexion en cours...</p>
              <p className="text-gray-400 text-sm mt-2">
                Complète le formulaire Facebook dans le popup qui s'est ouvert
              </p>
            </div>
          )}

          {/* ── STEP 3 : Succès ────────────────────────────── */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Bot activé !</h2>
              <p className="text-gray-500 text-sm mb-7">
                <strong className="text-gray-700">{shopName}</strong> répond maintenant
                automatiquement à tes clients en darija 24h/24.
              </p>
              <div className="space-y-3">
                <a href="/dashboard" className="btn-primary w-full">
                  Voir mon dashboard →
                </a>
                <a href="/dashboard/catalogue" className="btn-secondary w-full">
                  Ajouter mes produits
                </a>
              </div>
            </div>
          )}

          {/* ── STEP 4 : Erreur ────────────────────────────── */}
          {step === 'error' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❌</span>
              </div>
              <p className="text-red-600 font-semibold mb-2">Erreur de connexion</p>
              <p className="text-gray-400 text-sm mb-6 bg-red-50 rounded-lg p-3">{errorMsg}</p>
              <button onClick={() => { setStep('intro'); setErrorMsg('') }} className="btn-secondary">
                ← Réessayer
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
```

---

## `components/DashboardLayout.tsx`
### Layout partagé par toutes les pages dashboard

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard',                 icon: '📊', label: 'Vue d\'ensemble' },
  { href: '/dashboard/conversations',   icon: '💬', label: 'Conversations' },
  { href: '/dashboard/catalogue',       icon: '🛍️',  label: 'Catalogue' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="font-bold text-gray-800">SupportDarija</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">Bot actif</span>
          </div>
          <Link
            href="/onboarding"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors mt-1"
          >
            <span>⚙️</span> Paramètres
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>

    </div>
  )
}
```

---

## `app/dashboard/layout.tsx`
### Active DashboardLayout pour toutes les pages dashboard

```tsx
import DashboardLayout from '@/components/DashboardLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
```

---

## `app/dashboard/page.tsx` — Dashboard Principal

```tsx
import { supabaseAdmin } from '@/lib/supabase'

// ── Fonctions de récupération de données (Server Component) ──────────
// En production : récupère phoneNumberId depuis la session auth
// Pour le MVP : on passe en query param ou on utilise une valeur fixe

async function getStats(phoneNumberId: string) {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [total, today, orders, pending, handoffs] = await Promise.all([
    // Total messages traités par le bot
    supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number_id', phoneNumberId),

    // Messages reçus aujourd'hui
    supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number_id', phoneNumberId)
      .gte('created_at', todayStart.toISOString()),

    // Total commandes
    supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number_id', phoneNumberId),

    // Commandes en attente (à traiter)
    supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number_id', phoneNumberId)
      .eq('status', 'pending'),

    // Transferts humains (cas que le bot n'a pas pu gérer)
    supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number_id', phoneNumberId)
      .eq('handled_by', 'human'),
  ])

  return {
    total: total.count ?? 0,
    today: today.count ?? 0,
    orders: orders.count ?? 0,
    pending: pending.count ?? 0,
    handoffs: handoffs.count ?? 0,
  }
}

async function getRecentOrders(phoneNumberId: string) {
  const { data } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('phone_number_id', phoneNumberId)
    .order('created_at', { ascending: false })
    .limit(5)
  return data ?? []
}

async function getRecentConversations(phoneNumberId: string) {
  // Récupère les conversations uniques récentes (un row par client)
  const { data } = await supabaseAdmin
    .from('messages')
    .select('user_phone, content, direction, created_at')
    .eq('phone_number_id', phoneNumberId)
    .order('created_at', { ascending: false })
    .limit(50) // On filtre côté JS pour avoir les derniers msg par client
  
  if (!data) return []

  // Déduplique : garde seulement le dernier message par user_phone
  const seen = new Set<string>()
  return data.filter((msg) => {
    if (seen.has(msg.user_phone)) return false
    seen.add(msg.user_phone)
    return true
  }).slice(0, 6)
}

// ── Composants UI ──────────────────────────────────────────────────

function StatCard({ label, value, icon, sub, color = 'blue' }: {
  label: string
  value: string | number
  icon: string
  sub?: string
  color?: 'blue' | 'green' | 'yellow' | 'red'
}) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red:    'bg-red-50 text-red-600',
  }
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:   'badge-yellow',
    confirmed: 'badge-blue',
    shipped:   'badge-green',
    delivered: 'badge-green',
    cancelled: 'badge-red',
  }
  const labels: Record<string, string> = {
    pending:   '⏳ En attente',
    confirmed: '✅ Confirmée',
    shipped:   '🚛 Expédiée',
    delivered: '✅ Livrée',
    cancelled: '❌ Annulée',
  }
  return <span className={map[status] ?? 'badge-gray'}>{labels[status] ?? status}</span>
}

// ── Page principale ────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { pid?: string }
}) {
  // En prod : récupère depuis la session auth (middleware / cookie)
  const phoneNumberId = searchParams.pid ?? process.env.DEMO_PHONE_NUMBER_ID ?? ''

  const [stats, recentOrders, recentConvs] = await Promise.all([
    getStats(phoneNumberId),
    getRecentOrders(phoneNumberId),
    getRecentConversations(phoneNumberId),
  ])

  const botEfficiency = stats.total > 0
    ? Math.round(((stats.total - stats.handoffs) / stats.total) * 100)
    : 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Vue d'ensemble</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Messages traités (total)" value={stats.total.toLocaleString()} icon="💬" color="blue" />
        <StatCard label="Messages aujourd'hui"     value={stats.today}   icon="📅" sub="depuis minuit"  color="green" />
        <StatCard label="Commandes COD"            value={stats.orders}  icon="📦" sub={`${stats.pending} en attente`} color="yellow" />
        <StatCard label="Efficacité du bot"        value={`${botEfficiency}%`} icon="🤖" sub="résolus sans humain" color="green" />
      </div>

      {/* Grille : Commandes + Conversations récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Commandes récentes */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-800">Commandes récentes</h2>
            <a href="/dashboard/conversations" className="text-xs text-green-600 hover:underline">
              Voir tout →
            </a>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📦</p>
              <p className="text-sm">Aucune commande pour l'instant</p>
              <p className="text-xs mt-1">Les commandes COD apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{order.customer_name ?? 'Client'}</p>
                    <p className="text-xs text-gray-400">{order.wilaya} · {order.total} DT</p>
                  </div>
                  <div className="text-right">
                    <OrderStatusBadge status={order.status} />
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversations récentes */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-800">Conversations récentes</h2>
            <a href="/dashboard/conversations" className="text-xs text-green-600 hover:underline">
              Voir tout →
            </a>
          </div>

          {recentConvs.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm">Aucune conversation pour l'instant</p>
              <p className="text-xs mt-1">Les messages clients apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentConvs.map((msg: any) => (
                <a
                  key={msg.user_phone}
                  href={`/dashboard/conversations?phone=${msg.user_phone}`}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors block"
                >
                  <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800">+{msg.user_phone}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {msg.direction === 'outbound' ? '🤖 ' : '👤 '}
                      {msg.content}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
```

---

## `app/dashboard/catalogue/page.tsx` — Gestion Produits

```tsx
'use client'
import { useState, useEffect } from 'react'

type Product = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  sizes: string
  colors: string
  image_url: string
  is_active: boolean
}

type ProductForm = Omit<Product, 'id' | 'is_active'>

const EMPTY_FORM: ProductForm = {
  name: '', description: '', price: 0, stock: 0, sizes: '', colors: '', image_url: ''
}

// En prod : récupérer depuis la session auth
const PHONE_NUMBER_ID = process.env.NEXT_PUBLIC_DEMO_PHONE_NUMBER_ID ?? 'DEMO_ID'

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    setLoading(true)
    const res = await fetch(`/api/catalogue?phone_number_id=${PHONE_NUMBER_ID}`)
    const data = await res.json()
    setProducts(data.products ?? [])
    setLoading(false)
  }

  function openAddModal() {
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEditModal(product: Product) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      stock: product.stock,
      sizes: product.sizes ?? '',
      colors: product.colors ?? '',
      image_url: product.image_url ?? '',
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name || !form.price) return
    setSaving(true)

    try {
      if (editingProduct) {
        // Modifier un produit existant
        await fetch('/api/catalogue', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...form }),
        })
      } else {
        // Ajouter un nouveau produit
        await fetch('/api/catalogue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumberId: PHONE_NUMBER_ID, ...form }),
        })
      }
      await fetchProducts()
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce produit ?')) return
    await fetch(`/api/catalogue?id=${id}`, { method: 'DELETE' })
    await fetchProducts()
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Catalogue produits</h1>
          <p className="text-gray-500 text-sm mt-1">
            {products.length} produit{products.length !== 1 ? 's' : ''} · Le bot utilise ce catalogue pour répondre aux clients
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          + Ajouter un produit
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input max-w-sm"
        />
      </div>

      {/* États */}
      {loading && (
        <div className="text-center py-20 text-gray-400">
          <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Chargement...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-gray-600 font-medium mb-2">
            {searchQuery ? 'Aucun produit ne correspond à ta recherche' : 'Aucun produit pour l\'instant'}
          </p>
          {!searchQuery && (
            <p className="text-gray-400 text-sm mb-6">
              Ajoute tes produits pour que le bot puisse y répondre automatiquement
            </p>
          )}
          {!searchQuery && (
            <button onClick={openAddModal} className="btn-primary">
              + Ajouter mon premier produit
            </button>
          )}
        </div>
      )}

      {/* Grille produits */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <div key={product.id} className="card hover:shadow-md transition-shadow flex flex-col">
              {/* Image ou placeholder */}
              <div className="w-full h-40 bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🛍️</span>
                )}
              </div>

              {/* Infos produit */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight">{product.name}</h3>
                  <span className={product.stock > 0 ? 'badge-green' : 'badge-red'}>
                    {product.stock > 0 ? `${product.stock} en stock` : 'Épuisé'}
                  </span>
                </div>
                <p className="text-green-600 font-bold text-lg mb-2">{product.price} DT</p>
                {product.sizes && (
                  <p className="text-xs text-gray-400">Tailles : {product.sizes}</p>
                )}
                {product.colors && (
                  <p className="text-xs text-gray-400">Couleurs : {product.colors}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                <button
                  onClick={() => openEditModal(product)}
                  className="flex-1 btn-secondary !py-2 text-xs"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="btn-danger text-xs"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Ajouter / Modifier ────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {editingProduct ? '✏️ Modifier le produit' : '+ Nouveau produit'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Nom */}
              <div>
                <label className="label">Nom du produit *</label>
                <input
                  className="input"
                  placeholder="Ex: Blousa hamra, Pantalon beige..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="label">Description (optionnel)</label>
                <textarea
                  className="input !h-20 resize-none"
                  placeholder="Décris le produit..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Prix + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Prix (DT) *</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="45"
                    value={form.price || ''}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="label">Stock</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="10"
                    value={form.stock || ''}
                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Tailles + Couleurs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tailles (séparées par ,)</label>
                  <input
                    className="input"
                    placeholder="S,M,L,XL"
                    value={form.sizes}
                    onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Couleurs (séparées par ,)</label>
                  <input
                    className="input"
                    placeholder="rouge,bleu,vert"
                    value={form.colors}
                    onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="label">URL de l'image (optionnel)</label>
                <input
                  className="input"
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex-1"
                disabled={saving || !form.name || !form.price}
              >
                {saving ? 'Sauvegarde...' : editingProduct ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
```

---

## `app/dashboard/conversations/page.tsx` — Historique Messages

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'

type Message = {
  id: string
  user_phone: string
  content: string
  direction: 'inbound' | 'outbound'
  handled_by: string
  created_at: string
}

type Conversation = {
  user_phone: string
  last_message: string
  last_time: string
  unread: boolean
}

const PHONE_NUMBER_ID = process.env.NEXT_PUBLIC_DEMO_PHONE_NUMBER_ID ?? 'DEMO_ID'

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Charger la liste des conversations
  useEffect(() => { fetchConversations() }, [])

  // Auto-scroll vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchConversations() {
    setLoadingConvs(true)
    const res = await fetch(`/api/conversations?phone_number_id=${PHONE_NUMBER_ID}`)
    const data = await res.json()
    setConversations(data.conversations ?? [])
    setLoadingConvs(false)
  }

  async function fetchMessages(userPhone: string) {
    setSelectedPhone(userPhone)
    setLoadingMsgs(true)
    const res = await fetch(
      `/api/conversations/messages?phone_number_id=${PHONE_NUMBER_ID}&user_phone=${userPhone}`
    )
    const data = await res.json()
    setMessages(data.messages ?? [])
    setLoadingMsgs(false)
  }

  const filteredConvs = conversations.filter((c) =>
    c.user_phone.includes(searchQuery)
  )

  return (
    <div className="flex h-screen">

      {/* ── Colonne gauche : liste des conversations ─── */}
      <div className="w-80 border-r border-gray-100 bg-white flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-800 mb-3">Conversations</h1>
          <input
            type="text"
            placeholder="Rechercher par numéro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input !text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs && (
            <div className="text-center py-10 text-gray-400 text-sm">Chargement...</div>
          )}

          {!loadingConvs && filteredConvs.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm">Aucune conversation</p>
            </div>
          )}

          {filteredConvs.map((conv) => (
            <button
              key={conv.user_phone}
              onClick={() => fetchMessages(conv.user_phone)}
              className={`w-full text-left px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                selectedPhone === conv.user_phone ? 'bg-green-50 border-l-4 border-l-green-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">+{conv.user_phone}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(conv.last_time).toLocaleTimeString('fr-FR', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{conv.last_message}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Zone de droite : messages de la conversation ── */}
      <div className="flex-1 flex flex-col bg-gray-50">

        {/* Header conversation */}
        {selectedPhone ? (
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">👤</div>
            <div>
              <p className="font-semibold text-gray-800">+{selectedPhone}</p>
              <p className="text-xs text-gray-400">{messages.length} messages</p>
            </div>
          </div>
        ) : (
          <div className="bg-white border-b border-gray-100 px-6 py-4">
            <p className="text-gray-400 text-sm">Sélectionne une conversation</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {!selectedPhone && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="text-5xl mb-3">💬</p>
                <p className="font-medium">Sélectionne une conversation</p>
                <p className="text-sm mt-1">dans la liste à gauche</p>
              </div>
            </div>
          )}

          {loadingMsgs && (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loadingMsgs && messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.direction === 'inbound' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-sm ${msg.direction === 'inbound' ? 'items-start' : 'items-end'} flex flex-col gap-1`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.direction === 'inbound'
                    ? 'bg-white text-gray-800 shadow-sm rounded-tl-sm'
                    : 'bg-green-500 text-white rounded-tr-sm'
                }`}>
                  {msg.content}
                </div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  {msg.direction === 'outbound' && (
                    <span className={`text-xs ${msg.handled_by === 'human' ? 'badge-blue' : 'badge-gray'}`}>
                      {msg.handled_by === 'human' ? '👤 Humain' : '🤖 Bot'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

      </div>
    </div>
  )
}
```

---

## `app/api/conversations/route.ts` — Liste des conversations

```typescript
// Cette route est appelée par la page conversations pour lister
// toutes les conversations uniques (un client = une conversation)

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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
```

---

## `app/api/conversations/messages/route.ts` — Messages d'une conversation

```typescript
// Retourne tous les messages d'une conversation spécifique
// client (user_phone) ↔ vendeur (phone_number_id)

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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
```
