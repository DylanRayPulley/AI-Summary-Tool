import { NextRequest, NextResponse } from 'next/server'
import { getProvider, runCompletion } from '@/lib/ai'

const SUMMARY_SYSTEM = 'You are a helpful assistant that creates clear, well-organized summaries of notes. Focus on extracting key information, main ideas, and important details.'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    const userPrompt = `Please provide a comprehensive summary of the following notes. Organize the summary with clear sections, key points, and important details. Make it easy to understand and well-structured:\n\n${text}`

    const provider = getProvider()
    let summary: string

    try {
      summary = await runCompletion(SUMMARY_SYSTEM, userPrompt)
    } catch (providerError: unknown) {
      const err = providerError as Error
      if (provider === 'ollama') {
        throw new Error(
          `Ollama connection failed. Make sure Ollama is running locally. ` +
          `Install from https://ollama.ai and run: ollama pull ${process.env.OLLAMA_MODEL || 'llama3.2'}. ` +
          `Error: ${err.message}`
        )
      }
      throw providerError
    }

    return NextResponse.json({ summary, provider })
  } catch (error: unknown) {
    const err = error as Error & { status?: number }
    console.error('Error generating summary:', err)

    let errorMessage = err.message || 'Failed to generate summary'
    let statusCode = 500

    if (err.status === 429) {
      errorMessage = 'You have exceeded your API quota. Please check your billing and plan details.'
      statusCode = 429
    } else if (err.status === 401) {
      errorMessage = 'Invalid API key. Please check your API key in the .env.local file.'
      statusCode = 401
    } else if (err.status === 402) {
      errorMessage = 'Payment required. Please add a payment method to your account.'
      statusCode = 402
    } else if (err.message?.includes('quota')) {
      errorMessage = 'You have exceeded your API quota. Please check your billing.'
      statusCode = 429
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      },
      { status: statusCode }
    )
  }
}

export async function GET() {
  const provider = getProvider()
  return NextResponse.json({
    message: 'API route is working',
    provider,
    config: {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasHuggingFaceKey: !!process.env.HUGGINGFACE_API_KEY,
      ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
      ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2',
    },
  })
}
