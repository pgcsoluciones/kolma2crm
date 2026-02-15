import { NextRequest, NextResponse } from 'next/server'

// Simulación temporal
let fiados: any[] = []

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Filtrar fiados de este cliente
    const clientFiados = fiados
      .filter(f => f.clientId === params.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(clientFiados)
  } catch (error) {
    console.error('Error obteniendo fiados:', error)
    return NextResponse.json(
      { error: 'Error al obtener fiados' },
      { status: 500 }
    )
  }
}
