import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma.js'
import jwt from 'jsonwebtoken'

function getSecret() {
  return process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-canopy-secret' : '')
}

function getAccessCookie(request) {
  return request.cookies.get('canopy_access')?.value || request.cookies.get('canopy_token')?.value || ''
}

async function getAuthUser(request) {
  const secret = getSecret()
  if (!secret) return null
  const access = getAccessCookie(request)
  if (access) {
    try { return jwt.verify(access, secret) } catch (e) {}
  }
  const refresh = request.cookies.get('canopy_refresh')?.value || ''
  if (!refresh) return null
  try {
    const r = jwt.verify(refresh, secret)
    const u = await prisma.user.findUnique({ where: { id: r.uid }, select: { id: true } })
    if (!u) return null
    return { uid: u.id }
  } catch (e) {
    return null
  }
}

export async function PATCH(request, { params }) {
  const user = await getAuthUser(request)
  if (!user?.uid) return NextResponse.json({ ok: false }, { status: 401 })
  const resolved = await params
  const id = Number(resolved?.id)
  if (!id) return NextResponse.json({ ok: false, error: 'invalid_id' }, { status: 400 })
  const body = await request.json()
  const data = {}
  if (typeof body.title === 'string') data.title = body.title.trim()
  if (typeof body.description === 'string') data.description = body.description.trim()
  if (typeof body.category === 'string') data.category = body.category.trim() || null
  if (typeof body.price === 'number') data.price = body.price
  if (typeof body.imageUrl === 'string') data.imageUrl = body.imageUrl.trim() || null
  if (typeof body.condition === 'string') data.condition = body.condition.trim() || null
  if (typeof body.brandModel === 'string') data.brandModel = body.brandModel.trim() || null
  if (typeof body.originalPrice === 'number') data.originalPrice = body.originalPrice
  if (typeof body.negotiable === 'boolean') data.negotiable = body.negotiable
  if (typeof body.contactPhone === 'string') data.contactPhone = body.contactPhone.trim() || null
  if (typeof body.skills === 'string') data.skills = body.skills.trim() || null
  if (typeof body.pricingType === 'string') data.pricingType = body.pricingType.trim() || null
  if (Array.isArray(body.images)) {
    const imgs = body.images.filter(u => typeof u === 'string' && u.trim()).slice(0, 6)
    data.images = imgs
  }
  const existing = await prisma.listing.findUnique({ where: { id }, select: { id: true, userId: true } })
  if (!existing || existing.userId !== user.uid) return NextResponse.json({ ok: false }, { status: 403 })
  const updated = await prisma.listing.update({ where: { id }, data })
  return NextResponse.json({ ok: true, listing: updated })
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser(request)
  if (!user?.uid) return NextResponse.json({ ok: false }, { status: 401 })
  const resolved = await params
  const id = Number(resolved?.id)
  if (!id) return NextResponse.json({ ok: false, error: 'invalid_id' }, { status: 400 })
  const existing = await prisma.listing.findUnique({ where: { id }, select: { id: true, userId: true } })
  if (!existing || existing.userId !== user.uid) return NextResponse.json({ ok: false }, { status: 403 })
  await prisma.listing.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}