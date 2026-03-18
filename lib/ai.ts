import OpenAI from 'openai'

let openai: OpenAI | null = null
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export type Provider = 'openai' | 'ollama' | 'huggingface'

export function getProvider(): Provider {
  const p = process.env.AI_PROVIDER?.toLowerCase() as Provider
  if (p && ['openai', 'ollama', 'huggingface'].includes(p)) return p
  return 'ollama'
}

async function ollamaCompletion(systemMessage: string, userMessage: string): Promise<string> {
  const url = process.env.OLLAMA_URL || 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL || 'llama3.2'
  const res = await fetch(`${url}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      stream: false,
      options: { temperature: 0.7, num_predict: 2000 },
    }),
  })
  if (!res.ok) throw new Error(`Ollama error: ${res.status} - ${await res.text()}`)
  const data = await res.json()
  return data.message?.content || data.response || ''
}

async function huggingFaceCompletion(systemMessage: string, userMessage: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY || ''
  const model = process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2'
  const prompt = `${systemMessage}\n\n${userMessage}`
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`
  const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 2000, temperature: 0.7, return_full_text: false },
    }),
  })
  if (!res.ok) throw new Error(`Hugging Face error: ${res.status} - ${await res.text()}`)
  const data = await res.json()
  if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text
  if (data[0]?.summary_text) return data[0].summary_text
  if (typeof data === 'string') return data
  return JSON.stringify(data)
}

async function openAICompletion(systemMessage: string, userMessage: string): Promise<string> {
  if (!openai || !process.env.OPENAI_API_KEY) throw new Error('OpenAI API key not configured')
  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  })
  return completion.choices[0]?.message?.content || ''
}

export async function runCompletion(systemMessage: string, userMessage: string): Promise<string> {
  const provider = getProvider()
  switch (provider) {
    case 'ollama':
      return ollamaCompletion(systemMessage, userMessage)
    case 'huggingface':
      return huggingFaceCompletion(systemMessage, userMessage)
    case 'openai':
      return openAICompletion(systemMessage, userMessage)
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
