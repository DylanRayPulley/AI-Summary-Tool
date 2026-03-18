'use client'

import { useState, useEffect } from 'react'
import { FileText, Upload, Sparkles, Loader2, X, Cpu, Cloud, MessageCircle, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [provider, setProvider] = useState<string>('')
  const [providerInfo, setProviderInfo] = useState<any>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isAsking, setIsAsking] = useState(false)

  const handleDownloadSummary = () => {
    if (!summary.trim()) return
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const baseName = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'notes'
    a.href = url
    a.download = `${baseName}-summary.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPdf = async () => {
    if (!summary.trim()) return

    const baseName = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'notes'
    const { jsPDF } = await import('jspdf')

    const doc = new jsPDF()
    const margin = 10
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2
    const pageHeight = doc.internal.pageSize.getHeight() - margin

    doc.setFontSize(16)
    doc.text('AI Summary', margin, margin + 4)

    doc.setFontSize(12)
    const lines = doc.splitTextToSize(summary, pageWidth) as string[]
    let y = margin + 12
    const lineHeight = 6

    lines.forEach((line: string) => {
      if (y > pageHeight) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y)
      y += lineHeight
    })

    doc.save(`${baseName}-summary.pdf`)
  }

  useEffect(() => {
    // Check which provider is configured
    fetch('/api/summarize')
      .then(res => res.json())
      .then(data => {
        setProviderInfo(data)
        setProvider(data.provider || 'unknown')
      })
      .catch(() => {})
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setError('')

    const isTxt = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

    if (isTxt) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setFileContent(text)
        setInputText(text)
      }
      reader.readAsText(file)
      return
    }

    if (isPdf) {
      setIsExtracting(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to extract text from PDF')
        }
        setFileContent(data.text)
        setInputText(data.text)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to extract text from PDF')
      } finally {
        setIsExtracting(false)
      }
      return
    }

    setError('Please upload a .txt or .pdf file.')
  }

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setError('Please enter some notes to summarize')
      return
    }

    setIsLoading(true)
    setError('')
    setSummary('')

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
        }),
      })

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        throw new Error(
          response.status === 404
            ? 'API endpoint not found. Make sure the dev server is running.'
            : `Server returned non-JSON response: ${text.substring(0, 100)}`
        )
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary')
      }

      setSummary(data.summary)
      if (data.provider) {
        setProvider(data.provider)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the summary')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAsk = async () => {
    if (!question.trim()) {
      setError('Please enter a question')
      return
    }
    if (!inputText.trim()) {
      setError('Please add or upload notes first')
      return
    }
    setIsAsking(true)
    setError('')
    setAnswer('')
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, question: question.trim() }),
      })
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        const text = await response.text()
        throw new Error(response.status === 404 ? 'API not found.' : text.slice(0, 100))
      }
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to get answer')
      setAnswer(data.answer)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to get answer')
    } finally {
      setIsAsking(false)
    }
  }

  const handleClear = () => {
    setInputText('')
    setFileContent('')
    setFileName('')
    setSummary('')
    setQuestion('')
    setAnswer('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              AI Note Assistant
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Transform your notes into clear, organized summaries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Your Notes
            </h2>

            {/* Source Type removed for simplicity */}

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".txt,.pdf,text/plain,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isExtracting}
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition-colors bg-gray-50 dark:bg-gray-700 ${isExtracting ? 'cursor-wait border-blue-400 opacity-80' : 'cursor-pointer border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'}`}
                >
                  {isExtracting ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  ) : (
                    <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {isExtracting ? 'Extracting text...' : fileName || 'Choose a .txt or .pdf file'}
                  </span>
                </label>
              </div>
            </div>

            {/* Text Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Or Paste Your Notes
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your notes here, or upload a file above..."
                className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSummarize}
                disabled={isLoading || !inputText.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Summary
                  </>
                )}
              </button>
              <button
                onClick={handleClear}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Summary Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                AI Summary
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSummary}
                  disabled={!summary.trim()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Download .txt
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={!summary.trim()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>

            {summary ? (
              <div className="prose dark:prose-invert max-w-none">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <ReactMarkdown className="text-gray-800 dark:text-gray-200">
                    {summary}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <p className="text-gray-400 dark:text-gray-500 text-center">
                  Your AI-generated summary will appear here
                </p>
              </div>
            )}

            {/* Ask a question about the source */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5" />
                Ask about your notes
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Ask the AI questions using only the content from your notes or document.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                  placeholder="e.g. What were the main points?"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!inputText.trim() || isAsking}
                />
                <button
                  onClick={handleAsk}
                  disabled={!inputText.trim() || !question.trim() || isAsking}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Ask
                </button>
              </div>
              {answer ? (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Answer</p>
                  <div className="prose dark:prose-invert prose-sm max-w-none">
                    <ReactMarkdown className="text-gray-800 dark:text-gray-200">{answer}</ReactMarkdown>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            {provider === 'ollama' ? (
              <>
                <Cpu className="w-4 h-4" />
                <p>Powered by <span className="font-semibold">Ollama</span> (Local, Free)</p>
              </>
            ) : provider === 'huggingface' ? (
              <>
                <Cloud className="w-4 h-4" />
                <p>Powered by <span className="font-semibold">Hugging Face</span> (Free API)</p>
              </>
            ) : provider === 'openai' ? (
              <>
                <Sparkles className="w-4 h-4" />
                <p>Powered by <span className="font-semibold">OpenAI</span></p>
              </>
            ) : (
              <p>AI Provider: {provider || 'Checking...'}</p>
            )}
          </div>
          {provider === 'ollama' && (
            <p className="text-xs mt-1">
              Make sure Ollama is running. Install from <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="underline">ollama.ai</a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
