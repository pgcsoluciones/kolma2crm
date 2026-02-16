import { NextRequest, NextResponse } from 'next/server'
import { getDB, generateId } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, storeId, type, amount, description } = body

    if (!clientId || !storeId || !type || !amount) {
      return NextResponse.json(
        { error: 'clientId, storeId, type y amount son requeridos' },
        { status: 400 }
      )
    }

    if (type !== 'CHARGE' && type !== 'PAYMENT') {
      return NextResponse.json(
        { error: 'type debe ser CHARGE o PAYMENT' },
        { status: 400 }
      )
    }

    const db = await getDB()

    // Buscar cliente
    const client = await db
      .prepare('SELECT id, current_debt, credit_limit FROM clients WHERE id = ?')
      .bind(clientId)
      .first<{ id: string; current_debt: number; credit_limit: number }>()

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Calcular nuevo balance
    let newBalance = client.current_debt

    if (type === 'CHARGE') {
      newBalance = client.current_debt + amount

      // Verificar límite de crédito
      if (client.credit_limit > 0 && newBalance > client.credit_limit) {
        return NextResponse.json(
          {
            error: 'Excede el límite de crédito',
            currentDebt: client.current_debt,
            limit: client.credit_limit,
          },
          { status: 400 }
        )
      }
    } else {
      newBalance = client.current_debt - amount

      if (newBalance < 0) {
        return NextResponse.json(
          { error: 'El pago excede la deuda actual' },
          { status: 400 }
        )
      }
    }

    // Crear registro de fiado
    const fiadoId = generateId('fiado')

    await db
      .prepare(`
        INSERT INTO fiados (id, store_id, client_id, amount, type, balance, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        fiadoId,
        storeId,
        clientId,
        amount,
        type,
        newBalance,
        description || null
      )
      .run()

    // Actualizar balance del cliente
    await db
      .prepare('UPDATE clients SET current_debt = ? WHERE id = ?')
      .bind(newBalance, clientId)
      .run()

    const newFiado = {
      id: fiadoId,
      clientId,
      storeId,
      type,
      amount,
      balance: newBalance,
      description: description || '',
    }

    return NextResponse.json(newFiado, { status: 201 })
  } catch (error) {
    console.error('Error creando fiado:', error)
    return NextResponse.json(
      { error: 'Error al registrar fiado' },
      { status: 500 }
    )
  }
}