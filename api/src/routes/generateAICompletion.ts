import { FastifyInstance } from "fastify";
import { z } from 'zod'
import { streamToResponse, OpenAIStream } from 'ai'
import { prisma } from "../lib/prisma";
import { openai } from "../lib/openai";

export async function generateAICompletionRoute(app: FastifyInstance) {
  app.post('/ai/complete', async (request, response) => {
    const bodySchema = z.object({
      videoId: z.string().uuid(),
      prompt: z.string(),
      temperature: z.number().min(0).max(1).default(0.5),
    })
    const { videoId, prompt, temperature } = bodySchema.parse(request.body)

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    })

    if (!video.transcription) {
      return response.status(404).send({ error: 'Transcription not found.' })
    }

    const promptMessage = prompt.replace('{transcription}', video.transcription)
    const openaiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      temperature,
      messages: [
        { role: 'user', content: promptMessage }
      ],
      stream: true,
    })
    const stream = OpenAIStream(openaiResponse)

    streamToResponse(stream, response.raw, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      }
    })
  })
}
