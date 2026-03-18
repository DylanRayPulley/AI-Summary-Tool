# AI Note Assistant

An AI-powered note summarization tool that helps you transform your notes from lectures, documents, or written notes into clear, organized summaries. **Now supports FREE and LOCAL options!**

## Features

- 📝 **Multiple Input Methods**: Paste text directly or upload .txt files
- 🎯 **Source Type Selection**: Specify if your notes are from a lecture, document, or written notes for better context
- 🤖 **Multiple AI Providers**: Choose from Ollama (local/free), Hugging Face (free API), or OpenAI (paid)
- 🎨 **Modern UI**: Beautiful, responsive interface with dark mode support
- ⚡ **Fast & Efficient**: Quick summarization with real-time feedback

## AI Provider Options

### 🆓 Option 1: Ollama (Local & Free) - **RECOMMENDED**

Run AI models locally on your computer - completely free and private!

**Setup:**
1. Install Ollama from [https://ollama.ai](https://ollama.ai)
2. Download a model (recommended: `llama3.2`):
   ```bash
   ollama pull llama3.2
   ```
   Other good options: `mistral`, `llama2`, `codellama`
3. Make sure Ollama is running (it starts automatically after installation)
4. Create `.env.local`:
   ```
   AI_PROVIDER=ollama
   OLLAMA_MODEL=llama3.2
   ```
   (Optional: `OLLAMA_URL=http://localhost:11434` if using custom port)

**Pros:**
- ✅ Completely free
- ✅ Works offline
- ✅ Private (data never leaves your computer)
- ✅ No API keys needed

**Cons:**
- ⚠️ Requires local installation
- ⚠️ Needs sufficient RAM (4GB+ recommended)

---

### 🆓 Option 2: Hugging Face (Free API)

Use Hugging Face's free inference API - no local installation needed!

**Setup:**
1. Get a free API key from [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create `.env.local`:
   ```
   AI_PROVIDER=huggingface
   HUGGINGFACE_API_KEY=your_token_here
   HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2
   ```
   (API key is optional for some models, but recommended)

**Pros:**
- ✅ Free tier available
- ✅ No local installation
- ✅ No GPU required

**Cons:**
- ⚠️ Requires internet connection
- ⚠️ Rate limits on free tier
- ⚠️ May be slower than local

---

### 💰 Option 3: OpenAI (Paid)

Use OpenAI's GPT models for highest quality summaries.

**Setup:**
1. Get an API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Add payment method to your OpenAI account
3. Create `.env.local`:
   ```
   AI_PROVIDER=openai
   OPENAI_API_KEY=your_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo
   ```
   Available models: `gpt-3.5-turbo` (cheapest), `gpt-4o`, `gpt-4-turbo`, `gpt-4`

**Pros:**
- ✅ Highest quality summaries
- ✅ Fast and reliable
- ✅ No local resources needed

**Cons:**
- ❌ Requires payment
- ❌ Requires internet connection
- ❌ Data sent to external service

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Choose one AI provider (see above)

### Installation

1. Clone or download this project

2. Install dependencies:
```bash
npm install
```

3. **Choose and configure your AI provider** (see options above)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Select Source Type** (Optional): Choose whether your notes are from a lecture, document, or written notes
2. **Input Your Notes**: Either paste your notes in the text area or upload a .txt file
3. **Generate Summary**: Click the "Generate Summary" button
4. **View Results**: Your AI-generated summary will appear in the right panel

## Configuration

### Environment Variables (.env.local)

```bash
# Required: Choose your provider
AI_PROVIDER=ollama  # or 'huggingface' or 'openai'

# Ollama settings (if using Ollama)
OLLAMA_URL=http://localhost:11434  # Optional, defaults to localhost:11434
OLLAMA_MODEL=llama3.2  # Optional, defaults to llama3.2

# Hugging Face settings (if using Hugging Face)
HUGGINGFACE_API_KEY=your_token_here  # Optional but recommended
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2  # Optional

# OpenAI settings (if using OpenAI)
OPENAI_API_KEY=your_api_key_here  # Required for OpenAI
OPENAI_MODEL=gpt-3.5-turbo  # Optional, defaults to gpt-3.5-turbo
```

## Project Structure

```
├── app/
│   ├── api/
│   │   └── summarize/
│   │       └── route.ts      # API endpoint for summarization
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page component
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Ollama**: Local AI inference (default)
- **Hugging Face API**: Free cloud AI inference
- **OpenAI API**: Premium cloud AI inference
- **React Markdown**: Markdown rendering for summaries
- **Lucide React**: Beautiful icons

## Troubleshooting

### Ollama Issues
- **"Connection failed"**: Make sure Ollama is running. Check with `ollama list`
- **"Model not found"**: Run `ollama pull llama3.2` (or your chosen model)
- **Slow responses**: Try a smaller model like `llama3.2:1b` or ensure you have enough RAM

### Hugging Face Issues
- **Rate limit errors**: The free tier has limits. Wait a bit or get an API key
- **Model errors**: Some models may be unavailable. Try a different model in `.env.local`

### OpenAI Issues
- **Quota errors**: Add payment method at https://platform.openai.com/account/billing
- **API key errors**: Verify your key is correct in `.env.local`

## Notes

- Currently supports `.txt` file uploads. Support for other file types (PDF, DOCX, etc.) can be added in the future
- **Default provider is Ollama** (local/free) - no API keys needed!
- The app automatically detects which provider you've configured

## License

MIT
