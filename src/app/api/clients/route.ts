import { NextRequest, NextResponse } from 'next/server'

// Simulación temporal
let clients: any[] = []

// GET - Listar todos los clientes
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(clients)
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
    
    const newClient = {
      id: `client_${Date.now()}`,
      name: body.name,
      phone: body.phone,
      address: body.address || '',
      neighborhood: body.neighborhood || '',
      currentDebt: 0,
      creditLimit: body.creditLimit || 1000,
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
    }

    clients.push(newClient)

    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error('Error creando cliente:', error)
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    )
  }
}
