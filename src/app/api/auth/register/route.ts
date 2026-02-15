import { NextRequest, NextResponse } from 'next/server'

// Simulación temporal - en producción usaremos D1
let users: any[] = []
let organizations: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { colmadoName, ownerName, email, phone, password } = body

    // Validar que el email no exista
    if (users.find(u => u.email === email)) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      )
    }

    // Crear organización
    const orgId = `org_${Date.now()}`
    const organization = {
      id: orgId,
      name: colmadoName,
      ownerName,
      phone,
      createdAt: new Date().toISOString(),
    }
    organizations.push(organization)

    // Crear usuario
    const userId = `user_${Date.now()}`
    const user = {
      id: userId,
      email,
      name: ownerName,
      password, // En producción: bcrypt.hash(password, 10)
      organizationId: orgId,
      createdAt: new Date().toISOString(),
    }
    users.push(user)

    return NextResponse.json({
      success: true,
      message: 'Colmado registrado exitosamente',
    })
  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: 'Error al procesar registro' },
      { status: 500 }
    )
  }
}
