import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request) {
  try {
    const cookie = request.cookies.get('canopy_token')?.value || ''
    if (!cookie) return NextResponse.json({ ok: false }, { status: 401 })
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-canopy-secret' : '')
    if (!secret) return NextResponse.json({ ok: false }, { status: 500 })
    const decoded = jwt.verify(cookie, secret)
    return NextResponse.json({ ok: true, user: decoded })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
}