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
        (window as any).fbAsyncInit = function () {
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
            } catch { }
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
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${i <= currentStepIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
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

                            {/* <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-700 space-y-1.5">
                <p className="font-semibold">ℹ️ Ce qui va se passer :</p>
                <p>• Un popup Facebook s'ouvre</p>
                <p>• Tu sélectionnes ton compte WhatsApp Business</p>
                <p>• Meta vérifie ton numéro automatiquement</p>
                <p>• Ton bot est activé immédiatement ✅</p>
              </div> */}
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