'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Client {
  id: string
  name: string
  phone: string
  address: string
  neighborhood: string
  currentDebt: number
  creditLimit: number
  notes: string
}

interface Fiado {
  id: string
  amount: number
  type: 'CHARGE' | 'PAYMENT'
  balance: number
  description: string
  createdAt: string
}

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [fiados, setFiados] = useState<Fiado[]>([])
  const [loading, setLoading] = useState(true)
  const [showFiadoForm, setShowFiadoForm] = useState(false)
  const [fiadoType, setFiadoType] = useState<'CHARGE' | 'PAYMENT'>('CHARGE')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchClientData()
  }, [clientId])

  const fetchClientData = async () => {
    try {
      const [clientRes, fiadosRes] = await Promise.all([
        fetch(`/api/clients/${clientId}`),
        fetch(`/api/clients/${clientId}/fiados`)
      ])

      if (clientRes.ok && fiadosRes.ok) {
        const clientData = await clientRes.json()
        const fiadosData = await fiadosRes.json()
        setClient(clientData)
        setFiados(fiadosData)
      } else if (clientRes.status === 401) {
        router.push('/login')
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFiado = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/fiados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          type: fiadoType,
          amount: parseFloat(amount),
          description,
        }),
      })

      if (res.ok) {
        setAmount('')
        setDescription('')
        setShowFiadoForm(false)
        fetchClientData() // Refresh data
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Cliente no encontrado</p>
          <button
            onClick={() => router.push('/dashboard/clients')}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            ← Volver a clientes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">KOLMA2</h1>
            <button
              onClick={() => router.push('/dashboard/clients')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Clientes
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Client Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
              <p className="text-gray-600 mt-1">📞 {client.phone}</p>
              {client.neighborhood && (
                <p className="text-gray-600">📍 {client.neighborhood}</p>
              )}
              {client.address && (
                <p className="text-gray-600 text-sm mt-1">{client.address}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Balance Actual</p>
              <p className={`text-2xl font-bold ${client.currentDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                RD$ {client.currentDebt.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Límite de Crédito</p>
              <p className="text-2xl font-bold text-gray-900">
                RD$ {client.creditLimit.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {client.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Notas:</p>
              <p className="text-gray-900 mt-1">{client.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => {
              setFiadoType('CHARGE')
              setShowFiadoForm(true)
            }}
            className="bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            💰 Apuntar Fiado
          </button>
          <button
            onClick={() => {
              setFiadoType('PAYMENT')
              setShowFiadoForm(true)
            }}
            className="bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            💵 Registrar Pago
          </button>
        </div>

        {/* Fiado Form */}
        {showFiadoForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {fiadoType === 'CHARGE' ? '💰 Nuevo Fiado' : '💵 Registrar Pago'}
            </h3>
            <form onSubmit={handleSubmitFiado} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto (RD$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Arroz, aceite..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowFiadoForm(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Historial */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📋 Historial de Fiados</h3>
          
          {fiados.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay movimientos aún</p>
          ) : (
            <div className="space-y-3">
              {fiados.map((fiado) => (
                <div
                  key={fiado.id}
                  className={`p-4 rounded-lg ${
                    fiado.type === 'CHARGE' ? 'bg-red-50' : 'bg-green-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {fiado.type === 'CHARGE' ? '📤 Cargo' : '📥 Pago'}
                      </p>
                      {fiado.description && (
                        <p className="text-sm text-gray-600 mt-1">{fiado.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(fiado.createdAt).toLocaleDateString('es-DO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        fiado.type === 'CHARGE' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {fiado.type === 'CHARGE' ? '+' : '-'}RD$ {fiado.amount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-gray-600">
                        Balance: RD$ {fiado.balance.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
