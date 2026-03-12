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