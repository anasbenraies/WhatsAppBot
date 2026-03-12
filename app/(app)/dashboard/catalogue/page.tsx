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