import { NextRequest, NextResponse } from 'next/server'

let fiados: any[] = []

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const clientFiados = fiados
      .filter(f => f.clientId === id)
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
