import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const FREE_MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
]

async function callOpenRouter(model: string, messages: { role: string; content: string }[], apiKey: string) {
  return fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, stream: true }),
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { conversationId, message } = await req.json()

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })

  if (!conversation || conversation.userId !== session.user.id) {
    return new Response('Forbidden', { status: 403 })
  }

  // Save user message first
  await prisma.message.create({
    data: { conversationId, role: 'user', content: message },
  })

  // Build chat history
  const messages = conversation.messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))
  messages.push({ role: 'user', content: message })

  const apiKey = process.env.OPENROUTER_API_KEY!

  // Try each model until one works
  let response: Response | null = null
  for (const model of FREE_MODELS) {
    const res = await callOpenRouter(model, messages, apiKey)
    if (res.ok && res.body) {
      response = res
      console.log('Using model:', model)
      break
    }
    const errorText = await res.text().catch(() => '')
    console.warn(`Model ${model} failed (${res.status}), trying next...`)
  }

  if (!response || !response.body) {
    return new Response('All AI models busy, try again shortly', { status: 502 })
  }

  let fullResponse = ''
  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
            try {
              const json = JSON.parse(line.slice(6))
              const text = json.choices?.[0]?.delta?.content || ''
              if (text) {
                fullResponse += text
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
              }
            } catch {}
          }
        }
        await prisma.message.create({
          data: { conversationId, role: 'assistant', content: fullResponse },
        })
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
