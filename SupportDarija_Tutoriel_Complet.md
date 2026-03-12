# 🤖 SupportDarija — Tutoriel Technique Complet
## Stack : Next.js 14 (App Router) + Node.js (Agent IA) + Claude API + WhatsApp Cloud API + Supabase

---

## 🧠 Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                     SUPPORTDARIJA MVP                        │
│                                                             │
│  ┌──────────────────┐         ┌──────────────────────────┐  │
│  │   NEXT.JS APP    │         │     NODE.JS AGENT        │  │
│  │                  │         │                          │  │
│  │  • UI Dashboard  │◄───────►│  • Webhook /webhook      │  │
│  │  • Onboarding    │  HTTP   │  • Agent IA (Claude)     │  │
│  │  • Catalogue     │         │  • Envoi réponses WA     │  │
│  │  • Analytics     │         │  • Gestion conversations │  │
│  └──────────────────┘         └──────────────────────────┘  │
│           │                              │                   │
│           └──────────┬───────────────────┘                   │
│                      │                                       │
│              ┌───────▼──────┐                                │
│              │   SUPABASE   │                                │
│              │  PostgreSQL  │                                │
│              └──────────────┘                                │
└─────────────────────────────────────────────────────────────┘
```

**Pourquoi 2 services séparés ?**
- Next.js = UI + API Routes (dashboard vendeur, onboarding, catalogue)
- Node.js = Webhook WhatsApp (doit être ultra-rapide, répond en < 200ms à Meta sinon timeout)
- Les deux partagent la même base Supabase

---

## 📁 Structure des projets

```
supportdarija/
│
├── nextjs-app/                        # Frontend + Dashboard
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing page
│   │   ├── onboarding/
│   │   │   └── page.tsx               # Onboarding vendeur
│   │   ├── dashboard/
│   │   │   ├── page.tsx               # Dashboard principal
│   │   │   ├── catalogue/
│   │   │   │   └── page.tsx           # Gestion produits
│   │   │   └── conversations/
│   │   │       └── page.tsx           # Historique messages
│   │   └── api/
│   │       ├── onboarding/
│   │       │   ├── exchange-token/
│   │       │   │   └── route.ts       # Échange code Meta → token
│   │       │   └── save-vendor/
│   │       │       └── route.ts       # Sauvegarde vendeur en BDD
│   │       └── catalogue/
│   │           └── route.ts           # CRUD catalogue produits
│   ├── lib/
│   │   ├── supabase.ts                # Client Supabase
│   │   └── meta.ts                    # Helpers Meta API
│   ├── .env.local
│   └── package.json
│
└── agent-node/                        # Agent IA WhatsApp
    ├── src/
    │   ├── index.ts                   # Entry point + serveur Express
    │   ├── webhook.ts                 # Réception messages Meta
    │   ├── agent.ts                   # Logique IA Claude
    │   ├── whatsapp.ts                # Envoi messages WhatsApp
    │   └── database.ts                # Supabase client
    ├── .env
    ├── tsconfig.json
    └── package.json
```

---

## ⚙️ ÉTAPE 1 — Variables d'environnement

### `nextjs-app/.env.local`

```env
# Meta / WhatsApp
NEXT_PUBLIC_META_APP_ID=123456789          # App ID Meta (public, côté client)
META_APP_SECRET=abc123...                  # Secret Meta (jamais exposé côté client)
META_SYSTEM_USER_TOKEN=EAAxxxxx...         # Token permanent Meta (jamais exposé)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...       # Clé publique Supabase
SUPABASE_SERVICE_ROLE_KEY=eyJ...           # Clé privée (API Routes seulement)
```

### `agent-node/.env`

```env
# Meta / WhatsApp
META_VERIFY_TOKEN=supportdarija_secret_2025   # Token que TU inventes pour vérifier Meta
META_APP_SECRET=abc123...                     # Même secret que Next.js
META_SYSTEM_USER_TOKEN=EAAxxxxx...            # Même token que Next.js

# Claude API
ANTHROPIC_API_KEY=sk-ant-api03-...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Port
PORT=3001
```

---

## ⚙️ ÉTAPE 2 — Base de données Supabase

Crée ces tables dans Supabase (SQL Editor) :

```sql
-- ─────────────────────────────────────────
-- Table : vendors (les boutiques clientes)
-- ─────────────────────────────────────────
create table vendors (
  id            uuid    default gen_random_uuid() primary key,
  phone_number_id text  unique not null,  -- ID Meta du numéro WhatsApp
  waba_id       text    not null,         -- ID du compte WhatsApp Business
  shop_name     text,
  status        text    default 'active', -- active | paused | cancelled
  plan          text    default 'starter',
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────
-- Table : messages (toutes les conversations)
-- ─────────────────────────────────────────
create table messages (
  id              uuid    default gen_random_uuid() primary key,
  phone_number_id text    not null,   -- Numéro du vendeur (clé de partitionnement)
  user_phone      text    not null,   -- Numéro du client final
  content         text    not null,
  direction       text    not null,   -- 'inbound' (client→bot) | 'outbound' (bot→client)
  handled_by      text    default 'bot', -- 'bot' | 'human'
  created_at      timestamptz default now()
);

-- Index pour récupérer l'historique vite
create index idx_messages_conversation
  on messages (phone_number_id, user_phone, created_at desc);

-- ─────────────────────────────────────────
-- Table : catalog (produits par boutique)
-- ─────────────────────────────────────────
create table catalog (
  id              uuid    default gen_random_uuid() primary key,
  phone_number_id text    not null,
  name            text    not null,     -- ex: "Blousa hamra"
  description     text,
  price           numeric not null,     -- en DT
  stock           integer default 0,
  sizes           text,                 -- ex: "S,M,L,XL" ou null si taille unique
  colors          text,                 -- ex: "rouge,bleu,vert"
  image_url       text,
  is_active       boolean default true,
  created_at      timestamptz default now()
);

-- ─────────────────────────────────────────
-- Table : orders (commandes COD)
-- ─────────────────────────────────────────
create table orders (
  id              uuid    default gen_random_uuid() primary key,
  phone_number_id text    not null,
  user_phone      text    not null,
  customer_name   text,
  address         text,
  wilaya          text,
  items           jsonb,               -- [{name, price, qty, size}]
  total           numeric,
  status          text    default 'pending', -- pending | confirmed | shipped | delivered
  created_at      timestamptz default now()
);
```

---

## 🖥️ ÉTAPE 3 — Next.js App

### Installation

```bash
npx create-next-app@latest nextjs-app --typescript --tailwind --app
cd nextjs-app
npm install @supabase/supabase-js
```

---

### `lib/supabase.ts` — Client Supabase réutilisable

```typescript
// Ce fichier exporte 2 clients :
// - supabasePublic  : pour le frontend (clé anonyme)
// - supabaseAdmin   : pour les API Routes (clé service role = droits complets)

import { createClient } from '@supabase/supabase-js'

// Client public (composants React, lecture seule des données publiques)
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Client admin (API Routes uniquement, jamais exposé côté client)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

---

### `lib/meta.ts` — Helpers Meta API

```typescript
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
```

---

### `app/onboarding/page.tsx` — Onboarding vendeur

```tsx
'use client'
// Page d'onboarding : le vendeur connecte son numéro WhatsApp Business
// Flow : Embedded Signup Meta (popup) → on reçoit phone_number_id + waba_id → on sauvegarde

import { useState, useEffect } from 'react'

// Déclarer FB comme variable globale (SDK Meta injecté via useEffect)
declare const FB: any

export default function OnboardingPage() {
  const [step, setStep] = useState<'intro' | 'loading' | 'done' | 'error'>('intro')
  const [errorMsg, setErrorMsg] = useState('')
  const [shopName, setShopName] = useState('')

  useEffect(() => {
    // Initialiser le SDK Facebook au chargement de la page
    window.fbAsyncInit = function () {
      FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID!,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v19.0',
      })
    }

    // Injecter le script SDK Meta dynamiquement
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/fr_FR/sdk.js'
    script.async = true
    document.body.appendChild(script)

    // Écouter les messages envoyés par Meta via postMessage
    // Meta envoie les IDs (phone_number_id, waba_id) via ce canal
    const handleMessage = (event: MessageEvent) => {
      // Sécurité : vérifier que le message vient bien de Facebook
      if (event.origin !== 'https://www.facebook.com') return

      try {
        const data = JSON.parse(event.data)
        // Quand le vendeur termine le signup, Meta envoie cet événement
        if (data.type === 'WA_EMBEDDED_SIGNUP' && data.event === 'FINISH') {
          handleSignupFinished(data.data.phone_number_id, data.data.waba_id)
        }
        // Si le vendeur annule ou ferme la popup
        if (data.type === 'WA_EMBEDDED_SIGNUP' && data.event === 'CANCEL') {
          setStep('intro')
        }
      } catch {
        // Ignorer les messages non-JSON
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  /**
   * Lance le popup Embedded Signup Meta
   * C'est ici que le vendeur connecte son numéro WhatsApp Business
   * Meta gère toute la vérification du numéro en interne
   */
  function launchEmbeddedSignup() {
    setStep('loading')

    FB.login(
      async (response: any) => {
        if (response.authResponse?.code) {
          // Envoyer le code à notre API pour l'échanger contre un token
          await exchangeToken(response.authResponse.code)
        } else {
          // Le vendeur a fermé la popup sans finir
          setStep('intro')
        }
      },
      {
        config_id: 'TON_CONFIG_ID_EMBEDDED_SIGNUP', // Créé dans Meta Business Suite > Comptes WhatsApp
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

  /**
   * Échange le code éphémère Meta contre un token permanent
   * Appelé juste après le FB.login
   */
  async function exchangeToken(code: string) {
    try {
      const res = await fetch('/api/onboarding/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      // Le vendeur verra "done" après handleSignupFinished
    } catch (e: any) {
      setErrorMsg(e.message)
      setStep('error')
    }
  }

  /**
   * Appelé quand Meta envoie les IDs via postMessage
   * Sauvegarde le vendeur en base de données
   */
  async function handleSignupFinished(phoneNumberId: string, wabaId: string) {
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">

        {step === 'intro' && (
          <>
            <div className="text-5xl mb-4 text-center">📱</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Active ton bot WhatsApp
            </h1>
            <p className="text-gray-500 text-sm text-center mb-6">
              Connecte ton numéro WhatsApp Business en 2 minutes.
              Meta vérifie ton numéro automatiquement.
            </p>

            <input
              type="text"
              placeholder="Nom de ta boutique"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <button
              onClick={launchEmbeddedSignup}
              disabled={!shopName.trim()}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2"
            >
              <span>🟢</span>
              Connecter mon WhatsApp Business
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Tu seras redirigé vers Facebook pour connecter ton compte
            </p>
          </>
        )}

        {step === 'loading' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4 animate-spin">⚙️</div>
            <p className="text-gray-600">Connexion en cours...</p>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bot activé !</h2>
            <p className="text-gray-500 mb-6">
              Ton bot SupportDarija répond maintenant automatiquement
              à tes clients en darija tunisienne.
            </p>
            <a
              href="/dashboard"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition"
            >
              Voir mon dashboard →
            </a>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-4">
            <div className="text-5xl mb-4">❌</div>
            <p className="text-red-500 mb-4">{errorMsg}</p>
            <button
              onClick={() => setStep('intro')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-6 rounded-xl"
            >
              Réessayer
            </button>
          </div>
        )}

      </div>
    </main>
  )
}
```

---

### `app/api/onboarding/exchange-token/route.ts`

```typescript
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
```

---

### `app/api/onboarding/save-vendor/route.ts`

```typescript
// Sauvegarde le vendeur en base de données après le signup Meta
// C'est la dernière étape de l'onboarding

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getPhoneNumberInfo } from '@/lib/meta'

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
```

---

### `app/api/catalogue/route.ts` — CRUD Catalogue

```typescript
// API Route pour gérer le catalogue produits du vendeur
// GET    → liste des produits
// POST   → ajouter un produit
// PUT    → modifier un produit
// DELETE → supprimer un produit

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/catalogue?phone_number_id=xxx
export async function GET(req: NextRequest) {
  const phoneNumberId = req.nextUrl.searchParams.get('phone_number_id')

  if (!phoneNumberId) {
    return NextResponse.json({ error: 'phone_number_id requis' }, { status: 400 })
  }

  // ← Juste cette ligne protège toute la route
  const auth = await requireAuth(phoneNumberId)
  if (!auth.ok) return auth.response  // Retourne 401 ou 403 automatiquement

  const { data, error } = await supabaseAdmin
    .from('catalog')
    .select('*')
    .eq('phone_number_id', phoneNumberId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ products: data })
}

// POST /api/catalogue — Ajouter un produit
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { phoneNumberId, name, description, price, stock, sizes, colors, imageUrl } = body


// ← Juste cette ligne protège toute la route
  const auth = await requireAuth(phoneNumberId)
  if (!auth.ok) return auth.response  // Retourne 401 ou 403 automatiquement

  const { data, error } = await supabaseAdmin
    .from('catalog')
    .insert({
      phone_number_id: phoneNumberId,
      name,
      description,
      price,
      stock,
      sizes,
      colors,
      image_url: imageUrl,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ product: data })
}

// PUT /api/catalogue — Modifier un produit
export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body

  // ← Juste cette ligne protège toute la route
  const auth = await requireAuth(body.phoneNumberId)
  if (!auth.ok) return auth.response  // Retourne 401 ou 403 automatiquement

  const { data, error } = await supabaseAdmin
    .from('catalog')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ product: data })
}

// DELETE /api/catalogue?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')

  // ← Juste cette ligne protège toute la route
  const auth = await requireAuth(phoneNumberId)
  if (!auth.ok) return auth.response  // Retourne 401 ou 403 automatiquement

  const { error } = await supabaseAdmin
    .from('catalog')
    .update({ is_active: false })  // Soft delete
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
```

---

## 🤖 ÉTAPE 4 — Agent IA Node.js

### Installation

```bash
mkdir agent-node && cd agent-node
npm init -y
npm install express @anthropic-ai/sdk @supabase/supabase-js dotenv axios
npm install -D typescript @types/node @types/express ts-node nodemon
npx tsc --init
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### `package.json` — scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

### `src/database.ts` — Client Supabase

```typescript
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─────────────────────────────────────────────────
// Messages
// ─────────────────────────────────────────────────

/**
 * Sauvegarde un message en BDD
 * Appelé pour chaque message reçu (inbound) et envoyé (outbound)
 */
export async function saveMessage(
  phoneNumberId: string,
  userPhone: string,
  content: string,
  direction: 'inbound' | 'outbound',
  handledBy: 'bot' | 'human' = 'bot'
) {
  const { error } = await supabase.from('messages').insert({
    phone_number_id: phoneNumberId,
    user_phone: userPhone,
    content,
    direction,
    handled_by: handledBy,
  })

  if (error) console.error('Erreur saveMessage:', error)
}

/**
 * Récupère les N derniers messages d'une conversation
 * Utilisé pour donner le contexte de conversation à Claude
 */
export async function getConversationHistory(
  phoneNumberId: string,
  userPhone: string,
  limit = 10
): Promise<{ role: 'user' | 'assistant'; content: string }[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('content, direction')
    .eq('phone_number_id', phoneNumberId)
    .eq('user_phone', userPhone)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  // Inverser pour avoir les messages dans l'ordre chronologique
  // et convertir en format attendu par Claude API
  return data.reverse().map((msg) => ({
    role: msg.direction === 'inbound' ? 'user' : 'assistant',
    content: msg.content,
  }))
}

// ─────────────────────────────────────────────────
// Catalogue
// ─────────────────────────────────────────────────

/**
 * Récupère le catalogue produits d'un vendeur
 * Injecté dans le prompt système de Claude
 */
export async function getVendorCatalog(phoneNumberId: string) {
  const { data, error } = await supabase
    .from('catalog')
    .select('name, description, price, stock, sizes, colors')
    .eq('phone_number_id', phoneNumberId)
    .eq('is_active', true)

  if (error || !data) return []
  return data
}

/**
 * Vérifie si un vendeur est actif
 * Évite de traiter des messages pour des comptes suspendus
 */
export async function getVendorStatus(phoneNumberId: string): Promise<string | null> {
  const { data } = await supabase
    .from('vendors')
    .select('status')
    .eq('phone_number_id', phoneNumberId)
    .single()

  return data?.status ?? null
}

// ─────────────────────────────────────────────────
// Commandes
// ─────────────────────────────────────────────────

/**
 * Crée une commande COD
 */
export async function createOrder(order: {
  phoneNumberId: string
  userPhone: string
  customerName: string
  address: string
  wilaya: string
  items: any[]
  total: number
}) {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      phone_number_id: order.phoneNumberId,
      user_phone: order.userPhone,
      customer_name: order.customerName,
      address: order.address,
      wilaya: order.wilaya,
      items: order.items,
      total: order.total,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data.id
}
```

---

### `src/whatsapp.ts` — Envoi de messages

```typescript
import axios from 'axios'
import * as dotenv from 'dotenv'
dotenv.config()

const META_API = 'https://graph.facebook.com/v19.0'
const TOKEN = process.env.META_SYSTEM_USER_TOKEN!

/**
 * Envoie un message texte simple
 *
 * @param phoneNumberId  - L'ID Meta du numéro du vendeur (pas le numéro lui-même)
 * @param to             - Le numéro du client format international sans + (ex: 21655123456)
 * @param text           - Le texte à envoyer
 */
export async function sendTextMessage(
  phoneNumberId: string,
  to: string,
  text: string
): Promise<void> {
  try {
    await axios.post(
      `${META_API}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          preview_url: false,
          body: text,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log(`📤 Message envoyé à ${to}`)

  } catch (error: any) {
    console.error(`❌ Erreur envoi message à ${to}:`, error.response?.data || error.message)
    throw error
  }
}

/**
 * Envoie un message avec des boutons de réponse rapide
 * Utile pour le menu principal ou les confirmations
 */
export async function sendButtonMessage(
  phoneNumberId: string,
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
): Promise<void> {
  try {
    await axios.post(
      `${META_API}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: bodyText },
          action: {
            buttons: buttons.map((btn) => ({
              type: 'reply',
              reply: { id: btn.id, title: btn.title },
            })),
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error: any) {
    console.error('Erreur sendButtonMessage:', error.response?.data || error.message)
  }
}

/**
 * Marque un message comme "lu" (double coche bleue)
 * Bonne pratique UX — montre que le bot a reçu le message
 */
export async function markAsRead(
  phoneNumberId: string,
  messageId: string
): Promise<void> {
  try {
    await axios.post(
      `${META_API}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch {
    // Non-bloquant : si ça échoue, ce n'est pas critique
  }
}
```

---

### `src/agent.ts` — Cerveau IA Claude

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { getConversationHistory, getVendorCatalog, saveMessage } from './database'
import { sendTextMessage } from './whatsapp'
import * as dotenv from 'dotenv'
dotenv.config()

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// ─────────────────────────────────────────────────────────────────────
// PROMPT SYSTÈME
// Le cœur de l'agent : définit la personnalité, les règles, le contexte
// ─────────────────────────────────────────────────────────────────────

function buildSystemPrompt(catalogText: string): string {
  return `
Tu es l'assistant commercial d'une boutique en ligne tunisienne.
Tu t'appelles "Sami" et tu parles TOUJOURS en darija tunisienne authentique.

STYLE DE COMMUNICATION :
- Mélange naturel arabe dialectal tunisien + français (code-switching naturel)
- Exemple : "Yessir, 3andna taille M !" ou "Hélas stock khlas 😢"
- Chaleureux, humain, jamais robotique
- Maximum 2-3 phrases par réponse (WhatsApp = messages courts)
- Emojis avec modération (1-2 max par message)
- Si le client écrit en français pur → réponds en français
- Si le client écrit en arabe littéral → réponds en darija

CATALOGUE DISPONIBLE :
${catalogText}

CE QUE TU PEUX FAIRE :
1. Répondre aux questions produits (dispo, prix, tailles, couleurs)
2. Collecter les infos pour commande COD dans cet ordre exact :
   - Nom complet
   - Adresse + Wilaya
   - Numéro téléphone livreur
   - Confirmation récap commande
3. Informer sur la livraison (délais, prix)
4. Suivre une commande (si le client donne un numéro)

CE QUE TU NE DOIS PAS FAIRE :
- Modifier les prix du catalogue
- Promettre des délais de livraison précis sans info
- Si tu ne sais pas → dis "Nathnek m3a l'équipe" (transfert humain)

DÉTECTION COMMANDE COD :
Si le client veut commander, collecte les infos une par une de façon naturelle.
Quand tu as tout : nom, adresse, wilaya, téléphone → envoie un récap et demande confirmation.
Format récap :
"✅ Récap commande mta3ek :
• [produits + prix]
• Livraison : [adresse], [wilaya]
• Total : [X] DT (cash à la livraison)
Tout correct ? Réponds OUI pour confirmer 🙏"

MOTS DÉCLENCHEURS TRANSFERT HUMAIN :
Si le client dit : "agent", "humain", "responsable", "remboursement", 
"réclamation", "problème" → réponds uniquement :
"Nathnek m3a l'équipe bech y3awnek mlidh 🙏 — 5 minutes max !"
  `.trim()
}

// ─────────────────────────────────────────────────────────────────────
// FONCTION PRINCIPALE — Traite un message entrant et envoie la réponse
// ─────────────────────────────────────────────────────────────────────

export async function processMessage(
  userPhone: string,
  userText: string,
  phoneNumberId: string
): Promise<void> {

  // 1. Vérifier si transfert humain nécessaire AVANT d'appeler Claude
  //    (plus rapide et économise des tokens)
  if (needsHumanHandoff(userText)) {
    const handoffMsg = "Nathnek m3a l'équipe bech y3awnek mlidh 🙏 — 5 minutes max !"
    await sendTextMessage(phoneNumberId, userPhone, handoffMsg)
    await saveMessage(phoneNumberId, userPhone, handoffMsg, 'outbound', 'bot')
    // TODO: Notifier le vendeur (push notification, email, etc.)
    console.log(`🔔 Handoff humain requis — Client: ${userPhone}`)
    return
  }

  // 2. Récupérer l'historique de conversation (contexte pour Claude)
  //    Les 10 derniers messages = la mémoire du bot pour cette conversation
  const history = await getConversationHistory(phoneNumberId, userPhone, 10)

  // 3. Récupérer le catalogue du vendeur et le formater
  const catalog = await getVendorCatalog(phoneNumberId)
  const catalogText = formatCatalog(catalog)

  // 4. Construire les messages pour Claude
  //    On utilise l'historique comme contexte + le message actuel
  const messages: Anthropic.MessageParam[] = [
    ...history,
    { role: 'user', content: userText },
  ]

  // 5. Appel Claude API
  //    On utilise claude-haiku : rapide (< 1s) + pas cher + suffisant pour du chat
  const response = await claude.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,                          // Messages courts = moins de tokens
    system: buildSystemPrompt(catalogText),
    messages,
  })

  const replyText = (response.content[0] as Anthropic.TextBlock).text

  // 6. Envoyer la réponse via WhatsApp
  await sendTextMessage(phoneNumberId, userPhone, replyText)

  // 7. Sauvegarder la réponse du bot en BDD
  //    (pour l'historique et les analytics)
  await saveMessage(phoneNumberId, userPhone, replyText, 'outbound', 'bot')

  console.log(`🤖 Réponse envoyée à ${userPhone}: "${replyText.substring(0, 50)}..."`)
}

// ─────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────

/**
 * Détecte si le message nécessite un transfert à un humain
 */
function needsHumanHandoff(text: string): boolean {
  const triggers = [
    'agent', 'humain', 'responsable', 'manager',
    'remboursement', 'réclamation', 'plainte', 'problème grave',
    'parle à quelqu\'un', 'vrai personne',
  ]
  const lower = text.toLowerCase()
  return triggers.some((t) => lower.includes(t))
}

/**
 * Formate le catalogue en texte lisible pour le prompt Claude
 * Plus c'est clair dans le prompt, meilleures sont les réponses
 */
function formatCatalog(catalog: any[]): string {
  if (!catalog.length) {
    return 'Catalogue vide — dis au client de revenir bientôt.'
  }

  return catalog
    .map((item) => {
      const status = item.stock > 0 ? `✅ ${item.stock} en stock` : '❌ Épuisé'
      const sizes = item.sizes ? ` | Tailles: ${item.sizes}` : ''
      const colors = item.colors ? ` | Couleurs: ${item.colors}` : ''
      return `• ${item.name} — ${item.price} DT — ${status}${sizes}${colors}`
    })
    .join('\n')
}
```

---

### `src/webhook.ts` — Réception des messages Meta

```typescript
import { Router, Request, Response } from 'express'
import * as crypto from 'crypto'
import { saveMessage, getVendorStatus } from './database'
import { processMessage } from './agent'
import { markAsRead } from './whatsapp'
import * as dotenv from 'dotenv'
dotenv.config()

export const webhookRouter = Router()

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN!
const APP_SECRET = process.env.META_APP_SECRET!

// ─────────────────────────────────────────────────────────────
// GET /webhook — Vérification initiale par Meta
//
// Quand tu enregistres ton webhook dans la console Meta,
// Meta appelle cette route pour vérifier que tu contrôles bien le serveur.
// Tu dois retourner le hub.challenge tel quel.
// ─────────────────────────────────────────────────────────────
webhookRouter.get('/', (req: Request, res: Response) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook vérifié par Meta')
    res.status(200).send(challenge)  // Retourne le challenge → Meta confirme
  } else {
    console.warn('❌ Tentative de vérification webhook échouée')
    res.sendStatus(403)
  }
})

// ─────────────────────────────────────────────────────────────
// POST /webhook — Réception des messages
//
// Meta envoie ici CHAQUE message reçu par TOUS les numéros
// de tous tes vendeurs. Tu dois :
// 1. Vérifier la signature (sécurité — s'assurer que c'est bien Meta)
// 2. Parser le payload
// 3. Traiter le message
// 4. Répondre 200 IMMÉDIATEMENT (Meta timeout après 5s)
// ─────────────────────────────────────────────────────────────
webhookRouter.post('/', async (req: Request, res: Response) => {

  // ── Étape 1 : Vérifier la signature Meta ──────────────────
  // Meta signe chaque requête avec ton APP_SECRET
  // Si la signature est invalide → quelqu'un essaie de te spammer
  const signature = req.headers['x-hub-signature-256'] as string
  const rawBody = JSON.stringify(req.body)

  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', APP_SECRET)
    .update(rawBody)
    .digest('hex')

  if (!crypto.timingSafeEqual(
    Buffer.from(signature || ''),
    Buffer.from(expectedSignature)
  )) {
    console.warn('❌ Signature Meta invalide')
    return res.sendStatus(403)
  }

  // ── Étape 2 : Répondre 200 IMMÉDIATEMENT ─────────────────
  // CRITIQUE : Meta abandonne après 5 secondes
  // On répond tout de suite et on traite en arrière-plan
  res.sendStatus(200)

  // ── Étape 3 : Traiter le payload en arrière-plan ──────────
  try {
    const payload = req.body

    // Le payload peut contenir plusieurs entrées (batch)
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value

        // Ignorer les notifications de statut (delivered, read, etc.)
        // On ne traite que les vrais messages
        if (!value.messages || value.messages.length === 0) continue

        const message = value.messages[0]
        const metadata = value.metadata

        const userPhone = message.from              // Numéro du client
        const phoneNumberId = metadata.phone_number_id  // Numéro du vendeur
        const messageId = message.id

        // ── Marquer comme lu (double coche bleue) ────────────
        markAsRead(phoneNumberId, messageId)  // Fire and forget

        // ── Ignorer les messages non-texte (images, audio, etc.) ─
        if (message.type !== 'text') {
          console.log(`⏭️ Message non-texte ignoré (type: ${message.type})`)
          continue
        }

        const userText = message.text.body
        console.log(`📩 Message de ${userPhone}: "${userText}"`)

        // ── Vérifier que le vendeur est actif ────────────────
        const vendorStatus = await getVendorStatus(phoneNumberId)
        if (!vendorStatus || vendorStatus !== 'active') {
          console.log(`⏭️ Vendeur ${phoneNumberId} inactif — message ignoré`)
          continue
        }

        // ── Sauvegarder le message entrant ───────────────────
        await saveMessage(phoneNumberId, userPhone, userText, 'inbound')

        // ── Envoyer à l'agent IA pour traitement ─────────────
        await processMessage(userPhone, userText, phoneNumberId)
      }
    }

  } catch (error) {
    // Ne jamais crasher sur une erreur de traitement
    // Meta a déjà reçu son 200, on ne peut plus le rappeler
    console.error('❌ Erreur traitement webhook:', error)
  }
})
```

---

### `src/index.ts` — Serveur Express principal

```typescript
import express from 'express'
import { webhookRouter } from './webhook'
import * as dotenv from 'dotenv'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware : parser le JSON des requêtes entrantes
app.use(express.json())

// Route principale : toutes les routes webhook
app.use('/webhook', webhookRouter)

// Route santé : pour vérifier que le serveur tourne
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 Agent SupportDarija démarré sur le port ${PORT}`)
  console.log(`📡 Webhook URL : http://localhost:${PORT}/webhook`)
  console.log(`❤️  Health check : http://localhost:${PORT}/health`)
})
```

---

## 🚀 ÉTAPE 5 — Lancement & Tests

### Démarrer les deux services

```bash
# Terminal 1 — Next.js (Dashboard + API Routes)
cd nextjs-app
npm run dev
# → http://localhost:3000

# Terminal 2 — Agent IA Node.js
cd agent-node
npm run dev
# → http://localhost:3001

# Terminal 3 — Exposer le webhook avec ngrok (dev local)
npx ngrok http 3001
# → Copie l'URL : https://abc123.ngrok.io
```

### Enregistrer le webhook dans Meta

1. Va sur **developers.facebook.com → Ton App → WhatsApp → Configuration**
2. Dans "Webhook" → Modifier
3. URL de rappel : `https://abc123.ngrok.io/webhook`
4. Token de vérification : la valeur de `META_VERIFY_TOKEN` dans ton `.env`
5. Clique "Vérifier et sauvegarder"
6. Active l'abonnement **messages**

### Tester l'agent

```bash
# Simuler un message entrant (sans passer par WhatsApp)
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=CALCULE_LE_HASH" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "21655123456",
            "id": "msg_test_001",
            "type": "text",
            "text": { "body": "Salam, 3andkum blousa hamra ?" }
          }],
          "metadata": {
            "phone_number_id": "TON_PHONE_NUMBER_ID"
          }
        }
      }]
    }]
  }'
```

---

## 📊 Résumé du Flow complet

```
[Client écrit sur WhatsApp]
           ↓
     [Meta Cloud API]
           ↓
  POST /webhook (agent-node:3001)
           ↓
  Vérification signature Meta
           ↓
     Réponse 200 immédiate
           ↓  (traitement async)
  Sauvegarde message (Supabase)
           ↓
   Vérification vendeur actif
           ↓
  Récupération historique (10 msg)
           ↓
  Récupération catalogue vendeur
           ↓
    Appel Claude API (darija)
           ↓
  Envoi réponse → Meta → Client
           ↓
  Sauvegarde réponse (Supabase)
           ↓
  Dashboard Next.js (analytics) ✅
```
