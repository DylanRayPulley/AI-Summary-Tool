import { NextRequest, NextResponse } from 'next/server'
import { getProvider, runCompletion } from '@/lib/ai'

const ASK_SYSTEM = `You are a helpful assistant. Answer the user's question using ONLY the provided source material. Quote or paraphrase from the source when relevant. If the answer is not in the source, say so clearly. Do not add information from outside the source.`

export async function POST(request: NextRequest) {
  try {
    const { text, question } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No source text provided. Add or upload notes first.' },
        { status: 400 }
      )
    }

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'No question provided' },
        { status: 400 }
      )
    }

    const userPrompt = `Source material:\n\n${text}\n\nQuestion: ${question.trim()}`

    const provider = getProvider()
    let answer: string

    try {
      answer = await runCompletion(ASK_SYSTEM, userPrompt)
    } catch (providerError: unknown) {
      const err = providerError as Error
      if (provider === 'ollama') {
        throw new Error(
          `Ollama connection failed. Make sure Ollama is running. Error: ${err.message}`
        )
      }
      throw providerError
    }

    return NextResponse.json({ answer, provider })
  } catch (error: unknown) {
    const err = error as Error & { status?: number }
    console.error('Error answering question:', err)

    let errorMessage = err.message || 'Failed to get an answer'
    let statusCode = 500

    if (err.status === 429) statusCode = 429
    else if (err.status === 401) statusCode = 401
    else if (err.status === 402) statusCode = 402
    else if (err.message?.includes('quota')) statusCode = 429

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      },
      { status: statusCode }
    )
  }
}
