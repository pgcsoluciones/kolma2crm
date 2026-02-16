import { NextRequest, NextResponse } from 'next/server'
import { getDB, generateId } from '@/lib/db'

// GET - Listar todos los clientes
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

    const { results } = await db
      .prepare(`
        SELECT 
          id,
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
        WHERE store_id = ? AND is_active = 1
        ORDER BY name ASC
      `)
      .bind(storeId)
      .all()

    return NextResponse.json(results || [])
  } catch (error) {
    console.error('Error obteniendo clientes:', error)
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, name, phone, address, neighborhood, creditLimit, notes } = body

    if (!storeId || !name || !phone) {
      return NextResponse.json(
        { error: 'storeId, name y phone son requeridos' },
        { status: 400 }
      )
    }

    const db = await getDB()

    // Verificar si ya existe un cliente con ese teléfono en el mismo store
    const existing = await db
      .prepare('SELECT id FROM clients WHERE store_id = ? AND phone = ?')
      .bind(storeId, phone)
      .first()

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un cliente con ese teléfono' },
        { status: 400 }
      )
    }

    const clientId = generateId('client')

    await db
      .prepare(`
        INSERT INTO clients (id, store_id, name, phone, address, neighborhood, credit_limit, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        clientId,
        storeId,
        name,
        phone,
        address || null,
        neighborhood || null,
        creditLimit || 1000,
        notes || null
      )
      .run()

    const newClient = {
      id: clientId,
      name,
      phone,
      address: address || '',
      neighborhood: neighborhood || '',
      creditLimit: creditLimit || 1000,
      currentDebt: 0,
      notes: notes || '',
    }

    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error('Error creando cliente:', error)
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    )
  }
}