import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from '../../../../../lib/prisma.js'

export async function GET(request) {
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-canopy-secret' : '')
  if (!secret) return NextResponse.json({ ok: false }, { status: 500 })

  const access = request.cookies.get('canopy_access')?.value || request.cookies.get('canopy_token')?.value || ''
  if (access) {
    try {
      const decoded = jwt.verify(access, secret)
      return NextResponse.json({ ok: true, user: decoded })
    } catch (e) {}
  }

  const refresh = request.cookies.get('canopy_refresh')?.value || ''
  if (!refresh) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    const r = jwt.verify(refresh, secret)
    const u = await prisma.user.findUnique({ where: { id: r.uid }, select: { id: true, name: true, college: { select: { name: true } } } })
    if (!u) return NextResponse.json({ ok: false }, { status: 401 })
    const payload = { uid: u.id, name: u.name, collegeName: u.college?.name }
    const newAccess = jwt.sign(payload, secret, { expiresIn: '1h' })
    const res = NextResponse.json({ ok: true, user: payload })
    res.cookies.set('canopy_access', newAccess, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60, secure: process.env.NODE_ENV === 'production' })
    return res
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
}