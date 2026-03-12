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