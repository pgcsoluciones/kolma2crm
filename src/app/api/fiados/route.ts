import { NextRequest, NextResponse } from 'next/server'

// Simulación temporal - compartimos arrays
let clients: any[] = []
let fiados: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, type, amount, description } = body

    // Buscar cliente
    const client = clients.find(c => c.id === clientId)
    
    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Calcular nuevo balance
    let newBalance = client.currentDebt

    if (type === 'CHARGE') {
      // Es un cargo (nueva deuda)
      newBalance = client.currentDebt + amount
      
      // Verificar límite de crédito
      if (newBalance > client.creditLimit && client.creditLimit > 0) {
        return NextResponse.json(
          { 
            error: 'Excede el límite de crédito',
            current: newBalance,
            limit: client.creditLimit
          },
          { status: 400 }
        )
      }
    } else {
      // Es un pago (abono)
      newBalance = client.currentDebt - amount
      
      if (newBalance < 0) {
        return NextResponse.json(
          { error: 'El pago excede la deuda actual' },
          { status: 400 }
        )
      }
    }

    // Crear registro de fiado
    const newFiado = {
      id: `fiado_${Date.now()}`,
      clientId,
      type,
      amount,
      balance: newBalance,
      description: description || '',
      createdAt: new Date().toISOString(),
    }

    fiados.push(newFiado)

    // Actualizar balance del cliente
    client.currentDebt = newBalance

    return NextResponse.json(newFiado, { status: 201 })
  } catch (error) {
    console.error('Error creando fiado:', error)
    return NextResponse.json(
      { error: 'Error al registrar fiado' },
      { status: 500 }
    )
  }
}
