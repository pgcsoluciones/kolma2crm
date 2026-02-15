import { NextRequest, NextResponse } from 'next/server'

// Simulación temporal - compartimos el array de users
let users: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Buscar usuario
    const user = users.find(u => u.email === email)

    if (!user) {
      return NextResponse.json(
        { error: 'Email no encontrado' },
        { status: 401 }
      )
    }

    // Verificar contraseña (en producción: bcrypt.compare)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    // Retornar datos del usuario (sin contraseña)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
