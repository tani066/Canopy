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
      // Toggle inQuotes, handle escaped quotes
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
    const filePath = path.join(process.cwd(), 'database.csv')
    const content = await fs.readFile(filePath, 'utf8')

    const lines = content.split(/\r?\n/).filter(l => l && l.trim())
    if (lines.length === 0) {
      return NextResponse.json({ results: [] })
    }

    // Determine header and likely name column
    const headerCells = splitCSVLine(lines[0]).map(h => h.toLowerCase())
    let nameIndex = headerCells.findIndex(h =>
      ['college', 'college name', 'name', 'university', 'institute', 'institution'].some(k => h.includes(k))
    )

    // If header not helpful, attempt heuristic: pick the longest text column from first data row
    if (nameIndex === -1 && lines.length > 1) {
      const sample = splitCSVLine(lines[1])
      let maxLength = -1
      for (let i = 0; i < sample.length; i++) {
        const len = sample[i].length
        if (len > maxLength) {
          maxLength = len
          nameIndex = i
        }
      }
    }

    const resultsSet = new Set()
    for (let i = 1; i < lines.length; i++) {
      const cells = splitCSVLine(lines[i])
      const name = normalize(cells[nameIndex] || '')
      if (!name) continue
      if (name.toLowerCase().includes(query.toLowerCase())) {
        resultsSet.add(name)
        if (resultsSet.size >= limit) break
      }
    }

    const results = Array.from(resultsSet)
    return NextResponse.json({ results })
  } catch (err) {
    // Fallback: try regex search for likely college names within file when CSV parsing fails
    try {
      const filePath = path.join(process.cwd(), 'database.csv')
      const raw = await fs.readFile(filePath, 'utf8')
      const pattern = new RegExp(`[^\n,]*${query}[^\n,]*`, 'i')
      const candidates = raw.split(/\r?\n/)
        .map(line => (line.match(pattern) || [])[0])
        .filter(Boolean)
        .slice(0, limit)
      return NextResponse.json({ results: candidates })
    } catch (e) {
      return NextResponse.json({ results: [] })
    }
  }
}