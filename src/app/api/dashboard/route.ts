import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId es requerido' },
        { status: 400 }
      )
    }

    const db = await getDB()

    // Total de clientes
    const totalClientsResult = await db
      .prepare('SELECT COUNT(*) as count FROM clients WHERE store_id = ? AND is_active = 1')
      .bind(storeId)
      .first<{ count: number }>()

    // Clientes con deuda
    const clientsWithDebtResult = await db
      .prepare('SELECT COUNT(*) as count FROM clients WHERE store_id = ? AND is_active = 1 AND current_debt > 0')
      .bind(storeId)
      .first<{ count: number }>()

    // Total de fiados (deuda total)
    const totalFiadosResult = await db
      .prepare('SELECT COALESCE(SUM(current_debt), 0) as total FROM clients WHERE store_id = ? AND is_active = 1')
      .bind(storeId)
      .first<{ total: number }>()

    // Fiados del día
    const todayFiadosResult = await db
      .prepare(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM fiados 
        WHERE store_id = ? 
          AND type = 'CHARGE' 
          AND date(created_at) = date('now')
      `)
      .bind(storeId)
      .first<{ total: number }>()

    // Pagos del día
    const todayPaymentsResult = await db
      .prepare(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM fiados 
        WHERE store_id = ? 
          AND type = 'PAYMENT' 
          AND date(created_at) = date('now')
      `)
      .bind(storeId)
      .first<{ total: number }>()

    return NextResponse.json({
      totalClients: totalClientsResult?.count || 0,
      clientsWithDebt: clientsWithDebtResult?.count || 0,
      totalFiados: totalFiadosResult?.total || 0,
      todayFiados: todayFiadosResult?.total || 0,
      todayPayments: todayPaymentsResult?.total || 0,
    })
  } catch (error) {
    console.error('Error en dashboard:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos del dashboard' },
      { status: 500 }
    )
  }
}