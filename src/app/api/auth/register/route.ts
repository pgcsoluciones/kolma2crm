import { NextRequest, NextResponse } from 'next/server'
import { getDB, generateId } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { colmadoName, ownerName, email, phone, password } = body

    // Validaciones básicas
    if (!colmadoName || !ownerName || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    const db = await getDB()

    // Verificar si el email ya existe
    const existingUser = await db
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      )
    }

    // Crear store (colmado)
    const storeId = generateId('store')
    await db
      .prepare(
        'INSERT INTO stores (id, name, owner_name, phone, email) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(storeId, colmadoName, ownerName, phone || null, email)
      .run()

    // Crear usuario (dueño)
    const userId = generateId('user')
    await db
      .prepare(
        'INSERT INTO users (id, store_id, email, password, name, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(userId, storeId, email, password, ownerName, phone || null, 'owner')
      .run()

    // Crear suscripción con plan básico por defecto (trial)
    const subscriptionId = generateId('sub')
    await db
      .prepare(
        'INSERT INTO subscriptions (id, store_id, plan_id, status) VALUES (?, ?, ?, ?)'
      )
      .bind(subscriptionId, storeId, 'plan_basic', 'trial')
      .run()

    return NextResponse.json({
      success: true,
      message: 'Colmado registrado exitosamente',
      storeId,
      userId,
    })
  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: 'Error al procesar registro' },
      { status: 500 }
    )
  }
}