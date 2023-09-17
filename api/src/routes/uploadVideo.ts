import { FastifyInstance } from "fastify";
import { fastifyMultipart } from '@fastify/multipart'
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { pipeline } from 'node:stream'
import { promisify } from "node:util";
import { prisma } from "../lib/prisma";

const pump = promisify(pipeline)

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 25 * 1024 * 1024 // 25mb
    }
  })
  app.post('/videos', async (request, response) => {
    const data = await request.file()

    if (!data) {
      return response.status(400).send({ error: 'No file uploaded.' })
    }

    const extension = path.extname(data.filename)

    if (extension !== '.mp3') {
      return response.status(400).send({ error: 'Only .mp3 files are allowed.' })
    }

    const fileBaseName = path.basename(data.filename, extension)
    const fileUploadName = `${fileBaseName}-${randomUUID()}.${extension}`
    const uploadDestination = path.resolve(__dirname, '../../tmp', fileUploadName)

    await pump(data.file, fs.createWriteStream(uploadDestination))

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination,
      }
    })

    return response.status(201).send(video)
  })
}
