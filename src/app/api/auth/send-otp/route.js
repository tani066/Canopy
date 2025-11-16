import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma.js'
import { generateOTP } from '../../../../../lib/generateOtp.js'
import { sendEmail } from '../../../../../lib/email.js'
import fs from 'fs/promises'
import path from 'path'

function splitCSVLine(line) {
  const cells = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ } else { inQuotes = !inQuotes }
    } else if (ch === ',' && !inQuotes) { cells.push(current); current = '' } else { current += ch }
  }
  cells.push(current)
  return cells.map(c => c.trim())
}

function isEmailOnDomain(email, domain) {
  if (!email || !domain) return false
  const at = email.split('@')[1]?.toLowerCase()
  return at === domain.toLowerCase()
}

async function getCollegeFromCSVByName(name) {
  const filePath = path.join(process.cwd(), 'college_domains.csv')
  const content = await fs.readFile(filePath, 'utf8')
  const lines = content.split(/\r?\n/).filter(l => l && l.trim())
  const header = splitCSVLine(lines[0]).map(h => h.toLowerCase())
  const nameIndex = header.findIndex(h => h.includes('college name') || h.includes('name'))
  const domainIndex = header.findIndex(h => h.includes('email domain') || h.includes('domain'))
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCSVLine(lines[i])
    const nm = (cells[nameIndex] || '').trim()
    const domainRaw = (cells[domainIndex] || '').trim()
    if (nm.toLowerCase() === name.toLowerCase()) {
      return { name: nm, domain: domainRaw.replace(/^@/, '').toLowerCase() }
    }
  }
  return null
}

export async function POST(request) {
  try {
    const { collegeName, name, email } = await request.json()
    if (!collegeName || !name || !email) {
      return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
    }

    const csvCollege = await getCollegeFromCSVByName(collegeName)
    if (!csvCollege) {
      return NextResponse.json({ ok: false, error: 'college_not_found' }, { status: 404 })
    }

    if (csvCollege.domain && !isEmailOnDomain(email, csvCollege.domain)) {
      return NextResponse.json({ ok: false, error: 'email_domain_invalid', domain: csvCollege.domain }, { status: 400 })
    }

    // Ensure College exists in DB for relation; create if missing
    let college
    try {
      college = await prisma.college.upsert({
        where: { name: csvCollege.name },
        update: { domain: csvCollege.domain },
        create: { name: csvCollege.name, domain: csvCollege.domain }
      })
    } catch (e) {
      return NextResponse.json({ ok: false, error: 'db_error_college' }, { status: 500 })
    }

    const otp = generateOTP()
    const expiry = new Date(Date.now() + 5 * 60 * 1000)

    try {
      await prisma.user.upsert({
        where: { email },
        update: { name, otp, otpExpiry: expiry, verified: false, college: { connect: { id: college.id } } },
        create: { name, email, otp, otpExpiry: expiry, verified: false, role: 'student', college: { connect: { id: college.id } } }
      })
    } catch (e) {
      return NextResponse.json({ ok: false, error: 'db_error_user' }, { status: 500 })
    }

    const hasEmailCreds = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    const isDev = process.env.NODE_ENV !== 'production'
    if (hasEmailCreds) {
      try {
        await sendEmail(email, `Your Canopy OTP`, `Hello ${name},\n\nYour OTP is: ${otp}. It expires in 5 minutes.\n\nCollege: ${csvCollege.name}`)
        return NextResponse.json({ ok: true })
      } catch (e) {
        if (isDev) {
          console.log(`[DEV] Email send failed, OTP for ${email}: ${otp}`)
          return NextResponse.json({ ok: true, dev: true })
        }
        return NextResponse.json({ ok: false, error: 'email_send_failed' }, { status: 500 })
      }
    } else {
      if (isDev) {
        console.log(`[DEV] Email not configured, OTP for ${email}: ${otp}`)
        return NextResponse.json({ ok: true, dev: true })
      }
      return NextResponse.json({ ok: false, error: 'email_not_configured' }, { status: 500 })
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
