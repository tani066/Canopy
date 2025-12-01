import { NextResponse } from 'next/server'
import crypto from 'crypto'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || ''
    const api_key = process.env.CLOUDINARY_API_KEY || ''
    const api_secret = process.env.CLOUDINARY_API_SECRET || ''
    const upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET || ''
    if (!cloud_name) {
      return NextResponse.json({ ok: false, error: 'cloudinary_cloud_name_missing' }, { status: 500 })
    }

    const form = await request.formData()
    const file = form.get('file')
    const folder = (form.get('folder') || 'canopy').toString()
    if (!file) return NextResponse.json({ ok: false, error: 'no_file' }, { status: 400 })

    const uploadForm = new FormData()
    uploadForm.append('file', file)
    uploadForm.append('folder', folder)

    if (api_key && api_secret) {
      const timestamp = Math.floor(Date.now() / 1000)
      const toSign = `folder=${folder}&timestamp=${timestamp}`
      const signature = crypto.createHash('sha1').update(toSign + api_secret).digest('hex')
      uploadForm.append('timestamp', String(timestamp))
      uploadForm.append('api_key', api_key)
      uploadForm.append('signature', signature)
    } else if (upload_preset) {
      uploadForm.append('upload_preset', upload_preset)
    } else {
      return NextResponse.json({ ok: false, error: 'cloudinary_not_configured' }, { status: 500 })
    }

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
      method: 'POST',
      body: uploadForm
    })

    if (!res.ok) {
      let errText = ''
      try { errText = await res.text() } catch {}
      return NextResponse.json({ ok: false, error: 'upload_failed', details: errText }, { status: 500 })
    }
    const data = await res.json()
    return NextResponse.json({ ok: true, url: data.secure_url, asset: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}