'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [storeName, setStoreName] = useState('')
  const [data, setData] = useState({
    totalFiados: 0,
    totalClients: 0,
    clientsWithDebt: 0,
    todayFiados: 0,
    todayPayments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Obtener storeId del localStorage
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        router.push('/login')
        return
      }
      const user = JSON.parse(userStr)
      setStoreName(user.storeName || 'Mi Colmado')

      const res = await fetch(`/api/dashboard?storeId=${user.storeId}`)
      if (res.ok) {
        const dashboardData = await res.json()
        setData(dashboardData)
      } else if (res.status === 401) {
        router.push('/login')
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">KOLMA2</h1>
              <p className="text-sm text-gray-600">{storeName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString('es-DO', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Fiados</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  RD$ {(data.totalFiados || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clientes</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {data.totalClients || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Con Deuda</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {data.clientsWithDebt || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Today Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Fiados Hoy</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              RD$ {(data.todayFiados || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Pagos Hoy</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              RD$ {(data.todayPayments || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/dashboard/clients')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">👥</div>
              <h4 className="font-semibold text-gray-900">Ver Clientes</h4>
              <p className="text-sm text-gray-600 mt-1">Gestiona tu lista de clientes</p>
            </button>

            <button
              onClick={() => router.push('/dashboard/clients/new')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">➕</div>
              <h4 className="font-semibold text-gray-900">Nuevo Cliente</h4>
              <p className="text-sm text-gray-600 mt-1">Agrega un cliente nuevo</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}