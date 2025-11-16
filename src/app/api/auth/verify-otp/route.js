import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma.js'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  try {
    const { email, otp } = await request.json()
    if (!email || !otp) {
      return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, otp: true, otpExpiry: true, college: { select: { id: true, name: true } } } })
    if (!user || !user.otp || !user.otpExpiry) {
      return NextResponse.json({ ok: false, error: 'no_otp' }, { status: 404 })
    }

    if (user.otp !== otp) {
      return NextResponse.json({ ok: false, error: 'otp_invalid' }, { status: 400 })
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return NextResponse.json({ ok: false, error: 'otp_expired' }, { status: 400 })
    }

    await prisma.user.update({ where: { email }, data: { verified: true, otp: null, otpExpiry: null } })

    const payload = { uid: user.id, name: user.name, collegeName: user.college?.name }
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-canopy-secret' : '')
    if (!secret) {
      return NextResponse.json({ ok: false, error: 'jwt_secret_missing' }, { status: 500 })
    }
    const token = jwt.sign(payload, secret, { expiresIn: '7d' })

    const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, collegeName: user.college?.name } })
    res.cookies.set('canopy_token', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60, secure: process.env.NODE_ENV === 'production' })
    return res
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
