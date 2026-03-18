import { NextRequest, NextResponse } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const name = file.name.toLowerCase()
    const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf'
    const isTxt = name.endsWith('.txt') || file.type === 'text/plain'

    if (!isPdf && !isTxt) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a .txt or .pdf file.' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (isTxt) {
      const text = buffer.toString('utf-8')
      return NextResponse.json({ text })
    }

    // PDF
    const data = await pdfParse(buffer)
    const text = (data?.text || '').trim()

    if (!text) {
      return NextResponse.json(
        { error: 'No text could be extracted from this PDF. It might be scanned or image-based.' },
        { status: 422 }
      )
    }

    return NextResponse.json({ text })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Extract text error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to extract text from file' },
      { status: 500 }
    )
  }
}
