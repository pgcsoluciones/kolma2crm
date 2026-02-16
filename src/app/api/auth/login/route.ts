import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

interface UserRow {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  password: string;
  store_id: string;
  store_name: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const db = await getDB()

    // Buscar usuario con información del store
    const user = await db
      .prepare(`
        SELECT 
          u.id,
          u.email,
          u.name,
          u.phone,
          u.role,
          u.password,
          u.store_id,
          s.name as store_name
        FROM users u
        JOIN stores s ON u.store_id = s.id
        WHERE u.email = ? AND u.is_active = 1
      `)
      .bind(email)
      .first<UserRow>()

    if (!user) {
      return NextResponse.json(
        { error: 'Email no encontrado' },
        { status: 401 }
      )
    }

    // Verificar contraseña (en producción usar bcrypt)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    // Actualizar último login
    await db
      .prepare('UPDATE users SET last_login = datetime("now") WHERE id = ?')
      .bind(user.id)
      .run()

    // Retornar datos del usuario (sin contraseña)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        storeId: user.store_id,
        storeName: user.store_name,
      },
    })
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}