import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Simple CSV line splitter that respects quotes
function splitCSVLine(line) {
  const cells = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      cells.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  cells.push(current)
  return cells.map(c => c.trim())
}

function normalize(s) {
  return (s || '').toString().trim()
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = normalize(searchParams.get('query'))
  const limit = Number(searchParams.get('limit') || 10)

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const filePath = path.join(process.cwd(), 'college_domains.csv')
    const content = await fs.readFile(filePath, 'utf8')

    const lines = content.split(/\r?\n/).filter(l => l && l.trim())
    if (lines.length === 0) {
      return NextResponse.json({ results: [] })
    }

    const headerCells = splitCSVLine(lines[0]).map(h => h.toLowerCase())
    const nameIndex = headerCells.findIndex(h => h.includes('college name') || h.includes('name'))
    const domainIndex = headerCells.findIndex(h => h.includes('email domain') || h.includes('domain'))

    if (nameIndex === -1) {
      return NextResponse.json({ results: [] })
    }

    const resultsSet = new Set()
    for (let i = 1; i < lines.length; i++) {
      const cells = splitCSVLine(lines[i])
      const name = normalize(cells[nameIndex] || '')
      const rawDomain = domainIndex >= 0 ? normalize(cells[domainIndex] || '') : ''
      const domain = rawDomain.replace(/^@/, '').toLowerCase()
      if (!name) continue
      if (name.toLowerCase().includes(query.toLowerCase())) {
        resultsSet.add(JSON.stringify({ name, domain }))
        if (resultsSet.size >= limit) break
      }
    }

    const results = Array.from(resultsSet).map(s => JSON.parse(s))
    return NextResponse.json({ results })
  } catch (err) {
    // Fallback: simple regex search if parsing fails
    try {
      const filePath = path.join(process.cwd(), 'college_domains.csv')
      const raw = await fs.readFile(filePath, 'utf8')
      const lines = raw.split(/\r?\n/)
      const header = splitCSVLine(lines[0]).map(h => h.toLowerCase())
      const nameIndex = header.findIndex(h => h.includes('college name') || h.includes('name'))
      const domainIndex = header.findIndex(h => h.includes('email domain') || h.includes('domain'))
      const candidates = lines.slice(1)
        .map(line => splitCSVLine(line))
        .filter(cells => cells.length > nameIndex && (cells[nameIndex] || '').toLowerCase().includes(query.toLowerCase()))
        .map(cells => ({ name: cells[nameIndex], domain: (cells[domainIndex] || '').replace(/^@/, '').toLowerCase() }))
        .slice(0, limit)
      return NextResponse.json({ results: candidates })
    } catch (e) {
      return NextResponse.json({ results: [] })
    }
  }
}