import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { getAllPromptsRoute } from './routes/getAllPrompts'
import { uploadVideoRoute } from './routes/uploadVideo';
import { createTranscriptRoute } from './routes/createTranscript';
import { generateAICompletionRoute } from './routes/generateAICompletion';

const app = fastify();

app.register(fastifyCors, {
  origin: '*',
});

app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);
app.register(createTranscriptRoute);
app.register(generateAICompletionRoute);

app.listen({
  port: 3333,
}).then(() => {
  console.log('HTTP server running!')
})
