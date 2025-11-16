import { NextResponse } from 'next/server'
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

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const targetName = (searchParams.get('name') || '').trim().toLowerCase()
  if (!targetName) return NextResponse.json({ ok: false, error: 'name required' }, { status: 400 })
  try {
    const filePath = path.join(process.cwd(), 'college_domains.csv')
    const content = await fs.readFile(filePath, 'utf8')
    const lines = content.split(/\r?\n/).filter(l => l && l.trim())
    const header = splitCSVLine(lines[0]).map(h => h.toLowerCase())
    const nameIndex = header.findIndex(h => h.includes('college name') || h.includes('name'))
    const domainIndex = header.findIndex(h => h.includes('email domain') || h.includes('domain'))
    for (let i = 1; i < lines.length; i++) {
      const cells = splitCSVLine(lines[i])
      const name = (cells[nameIndex] || '').trim()
      const domainRaw = (cells[domainIndex] || '').trim()
      if (name.toLowerCase() === targetName) {
        const domain = domainRaw.replace(/^@/, '').toLowerCase()
        return NextResponse.json({ ok: true, college: { name, domain } })
      }
    }
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}