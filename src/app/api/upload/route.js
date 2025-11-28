import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request) {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || ''
  const api_key = process.env.CLOUDINARY_API_KEY || ''
  const api_secret = process.env.CLOUDINARY_API_SECRET || ''
  if (!cloud_name || !api_key || !api_secret) {
    return NextResponse.json({ ok: false, error: 'cloudinary_not_configured' }, { status: 500 })
  }
  const form = await request.formData()
  const file = form.get('file')
  const folder = (form.get('folder') || 'canopy').toString()
  if (!file) return NextResponse.json({ ok: false, error: 'no_file' }, { status: 400 })
  const timestamp = Math.floor(Date.now() / 1000)
  const toSign = `folder=${folder}&timestamp=${timestamp}`
  const signature = crypto.createHash('sha1').update(toSign + api_secret).digest('hex')

  const uploadForm = new FormData()
  uploadForm.append('file', file)
  uploadForm.append('timestamp', String(timestamp))
  uploadForm.append('api_key', api_key)
  uploadForm.append('signature', signature)
  uploadForm.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
    method: 'POST',
    body: uploadForm
  })
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: 'upload_failed' }, { status: 500 })
  }
  const data = await res.json()
  return NextResponse.json({ ok: true, url: data.secure_url, asset: data })
}