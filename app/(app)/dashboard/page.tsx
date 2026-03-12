// import { supabaseAdmin } from '@/lib/supabase'
// const supabase = null ;
// // ── Fonctions de récupération de données (Server Component) ──────────
// // En production : récupère phoneNumberId depuis la session auth
// // Pour le MVP : on passe en query param ou on utilise une valeur fixe

// async function getStats(phoneNumberId: string) {
//   const todayStart = new Date()
//   todayStart.setHours(0, 0, 0, 0)

//   const [total, today, orders, pending, handoffs] = await Promise.all([
//     // Total messages traités par le bot
//     supabaseAdmin
//       .from('messages')
//       .select('*', { count: 'exact', head: true })
//       .eq('phone_number_id', phoneNumberId),

//     // Messages reçus aujourd'hui
//     supabaseAdmin
//       .from('messages')
//       .select('*', { count: 'exact', head: true })
//       .eq('phone_number_id', phoneNumberId)
//       .gte('created_at', todayStart.toISOString()),

//     // Total commandes
//     supabaseAdmin
//       .from('orders')
//       .select('*', { count: 'exact', head: true })
//       .eq('phone_number_id', phoneNumberId),

//     // Commandes en attente (à traiter)
//     supabaseAdmin
//       .from('orders')
//       .select('*', { count: 'exact', head: true })
//       .eq('phone_number_id', phoneNumberId)
//       .eq('status', 'pending'),

//     // Transferts humains (cas que le bot n'a pas pu gérer)
//     supabaseAdmin
//       .from('messages')
//       .select('*', { count: 'exact', head: true })
//       .eq('phone_number_id', phoneNumberId)
//       .eq('handled_by', 'human'),
//   ])

//   return {
//     total: total.count ?? 0,
//     today: today.count ?? 0,
//     orders: orders.count ?? 0,
//     pending: pending.count ?? 0,
//     handoffs: handoffs.count ?? 0,
//   }
// }

// async function getRecentOrders(phoneNumberId: string) {
//   const { data } = await supabaseAdmin
//     .from('orders')
//     .select('*')
//     .eq('phone_number_id', phoneNumberId)
//     .order('created_at', { ascending: false })
//     .limit(5)
//   return data ?? []
// }

// async function getRecentConversations(phoneNumberId: string) {
//   // Récupère les conversations uniques récentes (un row par client)
//   const { data } = await supabaseAdmin
//     .from('messages')
//     .select('user_phone, content, direction, created_at')
//     .eq('phone_number_id', phoneNumberId)
//     .order('created_at', { ascending: false })
//     .limit(50) // On filtre côté JS pour avoir les derniers msg par client
  
//   if (!data) return []

//   type MessageRow = {
//     user_phone: string
//     content: string
//     direction: string
//     created_at: string
//   }

//   // Déduplique : garde seulement le dernier message par user_phone
//   const rows = data as MessageRow[]
//   const seen = new Set<string>()
//   return rows.filter((msg: MessageRow) => {
//     if (seen.has(msg.user_phone)) return false
//     seen.add(msg.user_phone)
//     return true
//   }).slice(0, 6)
// }

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

  const [stats, recentOrders, recentConvs] = [{
    total: 0,
    today: 0,
    orders: 0,
    pending: 0,
    handoffs: 0,
  }, [], []]
//   await Promise.all([
//     getStats(phoneNumberId),
//     getRecentOrders(phoneNumberId),
//     getRecentConversations(phoneNumberId),
//   ])

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