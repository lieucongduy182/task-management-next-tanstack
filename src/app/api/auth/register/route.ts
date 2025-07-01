import { generateToken, hashPassword } from '@/lib/auth'
import { createUser, getUserByEmail } from '@/lib/database'
import { registerSchema } from '@/lib/validation'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 },
      )
    }

    const hashedPassword = await hashPassword(password)
    const newUser = await createUser({ name, email, password: hashedPassword })

    const token = generateToken(newUser)
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json({
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
