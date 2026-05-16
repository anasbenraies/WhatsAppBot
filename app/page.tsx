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
      name: 'Starter', price: '49', popular: false,
      features: ['500 messages/mois', '50 produits catalogue', '1 agent humain', 'Support email 48h'],
    },
    {
      name: 'Pro', price: '99', popular: true,
      features: ['2 000 messages/mois', '500 produits catalogue', '3 agents humains', 'Support WhatsApp 24h'],
    },
    {
      name: 'Business', price: '199', popular: false,
      features: ['Messages illimités', 'Catalogue illimité', 'Agents illimités', 'Support prioritaire'],
    },
  ]

  const conversation = [
    { from: 'user', text: 'Salam, 3andkom maryoul ak7el simple taille M ?' },
    { from: 'bot', text: 'Salam ! 3andna taille M — 45 DT ✅. Thab taamel commande ?' },
    { from: 'user', text: 'ey nheb' },
    { from: 'bot', text: 'Behi ! a3tiini ismek please 🙏' },
    { from: 'user', text: 'Fatma Trabelsi' },
    { from: 'bot', text: "Merci Fatma ! W l'adresse + wilaya mta3ek ?" },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 h-16"
        style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem' }}>
          <span style={{ color: '#1DB954' }}>◆</span> SupportDarija
        </span>
        <div className="flex items-center gap-3">
          {/* <Link href="/dashboard" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
            Dashboard
          </Link> */}
          <Link href="/auth/register" className="btn-sp-outline text-sm" style={{ padding: '0.4rem 1rem' }}>
            Créer un compte
          </Link>
          <Link href="/auth/login" className="btn-sp-green text-sm" style={{ padding: '0.4rem 1rem' }}>
            Commencer →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex items-center justify-center text-center overflow-hidden"
        style={{ minHeight: '100vh', padding: '7rem 2rem 5rem' }}>

        {/* Glow vert derrière */}
        <div className="absolute pointer-events-none" style={{
          top: '-15%', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 600,
          background: 'radial-gradient(ellipse at center, rgba(29,185,84,0.16) 0%, transparent 65%)',
        }} />

        <div className="relative" style={{ zIndex: 1, maxWidth: 800 }}>
          {/* Pill */}
          <div className="inline-flex items-center gap-2 mb-8" style={{
            background: 'rgba(29,185,84,0.1)', border: '1px solid rgba(29,185,84,0.2)',
            color: '#1DB954', fontSize: '0.8rem', fontWeight: 500,
            padding: '0.35rem 1rem', borderRadius: 9999,
          }}>
            <span className="animate-pulse" style={{ width: 6, height: 6, background: '#1DB954', borderRadius: '50%', display: 'inline-block' }} />
            Bot actif pour 200+ boutiques tunisiennes
          </div>

          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(2.8rem, 8vw, 5.5rem)', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
            Ton bot WhatsApp<br />
            <span style={{ color: '#1DB954' }}>parle darija</span> 🇹🇳
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 2.5rem', fontWeight: 300 }}>
            Automatise ton service client WhatsApp en darija tunisienne authentique.
            Répond aux questions, prend les commandes COD, transfère les cas complexes — sans code.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register" className="btn-sp-green" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
              Activer mon bot — Gratuit →
            </Link>
            <a href="#demo" className="btn-sp-outline" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
              Voir la démo
            </a>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', marginTop: '1.5rem' }}>
            Configuration en 5 minutes · Aucune carte bancaire requise pour débuter
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="flex justify-center flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#121212' }}>
        {[
          { num: '200+', label: 'Boutiques actives' },
          { num: '1s', label: 'Temps de réponse' },
          { num: '95%', label: 'Messages gratuits Meta' },
          { num: '24/7', label: 'Disponibilité bot' },
        ].map((s, i, arr) => (
          <div key={s.num} className="text-center" style={{
            padding: '1.75rem 3rem',
            borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
          }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '2rem', color: '#1DB954', display: 'block' }}>{s.num}</span>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── How it works ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="sp-green text-xs font-semibold tracking-widest uppercase mb-3">Comment ça marche</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.02em' }}>
              Actif en moins de 5 minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '01', icon: '📝', title: 'Créer un compte', desc: 'Email + mot de passe. Aucune carte bancaire requise pour commencer.' },
              { step: '02', icon: '💬', title: 'Connecter WhatsApp', desc: 'Colle ton token Meta Business. Le bot est opérationnel en 60 secondes.' },
              { step: '03', icon: '📊', title: 'Dashboard + bot actif', desc: 'Suis tes conversations, commandes COD et clients en temps réel.' },
            ].map((item) => (
              <div key={item.step} style={{
                background: '#181818',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: '2rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <span style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.75rem',
                    color: '#1DB954', background: 'rgba(29,185,84,0.1)',
                    border: '1px solid rgba(29,185,84,0.2)',
                    padding: '0.2rem 0.6rem', borderRadius: 9999,
                  }}>
                    {item.step}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '0.5rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo ── */}
      <section id="demo" className="py-24 px-6 sp-surface">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <p className="sp-green text-xs font-semibold tracking-widest uppercase mb-3">Démo live</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              Voilà ce que voit ton client
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '1.5rem', lineHeight: 1.7, fontWeight: 300 }}>
              Une vraie conversation en darija — naturelle, rapide, efficace.
              Ton bot comprend le code-switching arabe/français comme un humain.
            </p>
            <ul className="space-y-3">
              {[
                'Comprend le darija, le français, et le mélange des deux',
                'Vérifie le stock en temps réel avant de répondre',
                'Collecte les infos COD étape par étape naturellement',
                'Transfère à toi si le client dit "agent" ou "responsable"',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                  <span style={{
                    width: 20, height: 20, flexShrink: 0, marginTop: 2,
                    background: 'rgba(29,185,84,0.12)', border: '1px solid rgba(29,185,84,0.25)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5 3.5-4" stroke="#1DB954" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mock WhatsApp */}
          <div className="flex-shrink-0 w-72">
            <div style={{ background: '#111', borderRadius: 28, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
              <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: 38, height: 38, background: '#1DB954', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', color: '#000', flexShrink: 0 }}>B</div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Boutique Rania 👗</div>
                  <div style={{ fontSize: '0.7rem', color: '#1DB954' }}>● En ligne</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {conversation.map((msg, i) => (
                  <div key={i} style={{
                    maxWidth: '85%', fontSize: '0.72rem', lineHeight: 1.5,
                    padding: '0.5rem 0.75rem', borderRadius: 14,
                    alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.from === 'user' ? '#005c4b' : '#282828',
                    color: msg.from === 'user' ? '#e9fbe5' : 'rgba(255,255,255,0.85)',
                    borderBottomRightRadius: msg.from === 'user' ? 4 : 14,
                    borderBottomLeftRadius: msg.from === 'bot' ? 4 : 14,
                  }}>{msg.text}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-14" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.02em' }}>
            Tout ce dont tu as besoin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="sp-feature-card" style={{
                background: '#181818',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: '1.75rem',
                transition: 'background 150ms',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.875rem' }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '0.5rem' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 px-6 sp-surface">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Tarifs simples et transparents
          </h2>
          <p className="text-center mb-14" style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
            En dinars tunisiens · Sans engagement · Résiliable à tout moment
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.name} className="relative flex flex-col" style={{
                background: plan.popular ? 'linear-gradient(160deg, rgba(29,185,84,0.07) 0%, #181818 55%)' : '#181818',
                border: `1px solid ${plan.popular ? '#1DB954' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 16, padding: '2rem',
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                    background: '#1DB954', color: '#000', fontSize: '0.68rem', fontWeight: 700,
                    padding: '0.2rem 1rem', borderRadius: '0 0 8px 8px', whiteSpace: 'nowrap',
                  }}>⭐ POPULAIRE</div>
                )}
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                  {plan.name}
                </div>
                <div style={{ marginBottom: '0.25rem' }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '3rem', letterSpacing: '-0.03em' }}>{plan.price}</span>
                  <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', marginLeft: '0.25rem' }}>DT/mois</span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '1.25rem 0' }} />
                <ul className="flex flex-col gap-3 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
                      <span style={{ width: 5, height: 5, background: '#1DB954', borderRadius: '50%', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" style={{
                  display: 'block', textAlign: 'center', padding: '0.75rem', borderRadius: 9999,
                  fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none',
                  background: plan.popular ? '#1DB954' : 'rgba(255,255,255,0.06)',
                  color: plan.popular ? '#000' : '#fff',
                  border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.08)',
                }}>
                  Commencer
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-24 px-6 text-center" style={{ background: '#1DB954' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#000', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
          Prêt à automatiser ?
        </h2>
        <p style={{ color: 'rgba(0,0,0,0.55)', marginBottom: '2rem', fontSize: '1rem' }}>
          Rejoins 200+ boutiques qui répondent en darija, 24h/24.
        </p>
        <Link href="/auth/register" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#000', color: '#fff', fontWeight: 700, fontSize: '1rem',
          padding: '0.875rem 2rem', borderRadius: 9999, textDecoration: 'none',
        }}>
          Créer mon compte gratuit →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 text-center sp-surface" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          <span style={{ color: '#1DB954' }}>◆</span> SupportDarija
        </p>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>Fait avec ❤️ pour les boutiques tunisiennes</p>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.15)', marginTop: '0.25rem' }}>© {new Date().getFullYear()} SupportDarija. Tous droits réservés.</p>
      </footer>

    </div>
  )
}