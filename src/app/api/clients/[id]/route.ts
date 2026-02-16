import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const db = await getDB()

    const client = await db
      .prepare(`
        SELECT 
          id,
          store_id as storeId,
          name,
          phone,
          address,
          neighborhood,
          notes,
          credit_limit as creditLimit,
          current_debt as currentDebt,
          is_active as isActive,
          created_at as createdAt
        FROM clients 
        WHERE id = ?
      `)
      .bind(id)
      .first()

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error obteniendo cliente:', error)
    return NextResponse.json(
      { error: 'Error al obtener cliente' },
      { status: 500 }
    )
  }
}