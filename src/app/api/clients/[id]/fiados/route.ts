import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const db = await getDB()

    const { results } = await db
      .prepare(`
        SELECT 
          id,
          client_id as clientId,
          store_id as storeId,
          amount,
          type,
          balance,
          description,
          created_at as createdAt
        FROM fiados 
        WHERE client_id = ?
        ORDER BY created_at DESC
      `)
      .bind(id)
      .all()

    return NextResponse.json(results || [])
  } catch (error) {
    console.error('Error obteniendo fiados:', error)
    return NextResponse.json(
      { error: 'Error al obtener fiados' },
      { status: 500 }
    )
  }
}