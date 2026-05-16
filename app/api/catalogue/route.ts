// API Route pour gérer le catalogue produits du vendeur
// GET    → liste des produits
// POST   → ajouter un produit
// PUT    → modifier un produit
// DELETE → supprimer un produit

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

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
  const phoneNumberId = req.nextUrl.searchParams.get('phone_number_id')

  // ← Juste cette ligne protège toute la route
  const auth = await requireAuth(phoneNumberId as string)
  if (!auth.ok) return auth.response  // Retourne 401 ou 403 automatiquement

  const { error } = await supabaseAdmin
    .from('catalog')
    .update({ is_active: false })  // Soft delete
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}