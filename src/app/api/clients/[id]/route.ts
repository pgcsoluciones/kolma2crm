import { NextRequest, NextResponse } from 'next/server'

let clients: any[] = []

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = clients.find(c => c.id === id)
    
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
