import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma.js'
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
    try {
      const decoded = jwt.verify(access, secret)
      return decoded
    } catch (e) {}
  }
  const refresh = request.cookies.get('canopy_refresh')?.value || ''
  if (!refresh) return null
  try {
    const r = jwt.verify(refresh, secret)
    const u = await prisma.user.findUnique({ where: { id: r.uid }, select: { id: true, name: true, college: { select: { id: true, name: true } } } })
    if (!u) return null
    return { uid: u.id, name: u.name, collegeName: u.college?.name }
  } catch (e) {
    return null
  }
}

export async function GET(request) {
  const user = await getAuthUser(request)
  if (!user?.uid) return NextResponse.json({ ok: false }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const type = (searchParams.get('type') || '').toLowerCase()
  const mine = (searchParams.get('mine') || '').toLowerCase() === 'true'
  if (!['service', 'product'].includes(type)) {
    if (!mine) return NextResponse.json({ ok: false, error: 'invalid_type' }, { status: 400 })
  }
  let where
  if (mine) {
    where = { userId: user.uid }
    if (['service', 'product'].includes(type)) where.type = type
  } else {
    where = { type, college: { name: user.collegeName } }
  }
  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, description: true, type: true, price: true, category: true, imageUrl: true, condition: true, brandModel: true, originalPrice: true, negotiable: true, images: true, createdAt: true, user: { select: { id: true, name: true } } }
  })
  return NextResponse.json({ ok: true, listings })
}

export async function POST(request) {
  const user = await getAuthUser(request)
  if (!user?.uid) return NextResponse.json({ ok: false }, { status: 401 })
  const body = await request.json()
  const title = (body.title || '').trim()
  const description = (body.description || '').trim()
  const type = (body.type || '').toLowerCase()
  const price = typeof body.price === 'number' ? body.price : null
  const category = (body.category || '').trim() || null
  const imageUrl = (body.imageUrl || '').trim() || null
  const condition = (body.condition || '').trim() || null
  const brandModel = (body.brandModel || '').trim() || null
  const originalPrice = typeof body.originalPrice === 'number' ? body.originalPrice : null
  const negotiable = typeof body.negotiable === 'boolean' ? body.negotiable : null
  const images = Array.isArray(body.images) ? body.images.filter(u => typeof u === 'string' && u.trim()).slice(0, 6) : []
  if (!title || !description || !['service', 'product'].includes(type)) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
  }
  const dbUser = await prisma.user.findUnique({ where: { id: user.uid }, select: { id: true, collegeId: true } })
  if (!dbUser) return NextResponse.json({ ok: false }, { status: 401 })
  const created = await prisma.listing.create({ data: { title, description, type, price, category, imageUrl, condition, brandModel, originalPrice, negotiable, images, userId: dbUser.id, collegeId: dbUser.collegeId } })
  return NextResponse.json({ ok: true, listing: created })
}