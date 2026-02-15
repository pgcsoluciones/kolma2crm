import { NextRequest, NextResponse } from 'next/server'

// Simulación temporal - datos de ejemplo
let clients: any[] = []

export async function GET(request: NextRequest) {
  try {
    // Calcular métricas
    const totalClients = clients.length
    const clientsWithDebt = clients.filter(c => c.currentDebt > 0).length
    const totalFiados = clients.reduce((sum, c) => sum + (c.currentDebt || 0), 0)

    return NextResponse.json({
      totalFiados,
      totalClients,
      clientsWithDebt,
    })
  } catch (error) {
    console.error('Error en dashboard:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos del dashboard' },
      { status: 500 }
    )
  }
}
