'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


export default function RegisterPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [adresse, setAdresse] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [done, setDone] = useState(false)

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        if (password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères')
            return
        }
        setLoading(true)
        setError('')



        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    adresse: adresse
                }
            }
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        // create profile row
        // const { error: profileError } = await supabase.from("vendors").insert({
        //     user_id: data?.user?.id ,
        //     adresse,
        // });

        // if (profileError) {
        //     setError("Erreur lors de la création du profil : " + profileError.message);
        //     setLoading(false);
        //     return;
        // }

        setDone(true);
    }

    if (done) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">
                    <div className="text-5xl mb-4">📧</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Vérifie ton email</h2>
                    <p className="text-gray-500 text-sm">
                        On t'a envoyé un lien de confirmation à <strong>{email}</strong>.
                        Clique dessus pour activer ton compte.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8">
                <div className="text-center mb-8">
                    <span className="text-4xl">🤖</span>
                    <h1 className="text-2xl font-bold text-gray-800 mt-3">Créer un compte</h1>
                    <p className="text-gray-500 text-sm mt-1">Commence à automatiser ton WhatsApp</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">


                    <div>
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="toi@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Mot de passe</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="8 caractères minimum"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Adresse de la boutique </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Tunis , Ariana , Sousse..."
                            value={adresse}
                            onChange={(e) => setAdresse(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                            ❌ {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? 'Création...' : 'Créer mon compte →'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Déjà un compte ?{' '}
                    <Link href="/auth/login" className="text-green-600 font-medium hover:underline">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    )
}