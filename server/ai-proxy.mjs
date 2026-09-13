import express from 'express';

const app = express();
const port = Number(process.env.AI_PORT ?? 3001);
const openAiEndpoint = 'https://api.openai.com/v1/chat/completions';

app.use(express.json({ limit: '32kb' }));
app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  response.header('Access-Control-Allow-Headers', 'Content-Type');
  response.header('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (request.method === 'OPTIONS') {
    return response.sendStatus(204);
  }

  next();
});

app.post('/api/ai/chat', async (request, response) => {
  const prompt = request.body?.prompt;

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return response.status(400).json({ error: 'A non-empty prompt is required.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return response.status(503).json({ error: 'AI service is not configured.' });
  }

  try {
    const upstreamResponse = await fetch(openAiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'developer', content: 'You are a helpful assistant for an expense tracker.' },
          { role: 'user', content: prompt.trim() }
        ]
      })
    });

    if (!upstreamResponse.ok) {
      return response.status(502).json({ error: 'The AI provider request failed.' });
    }

    const payload = await upstreamResponse.json();
    const content = payload?.choices?.[0]?.message?.content;

    if (typeof content !== 'string' || !content.trim()) {
      return response.status(502).json({ error: 'The AI provider returned an invalid response.' });
    }

    return response.json({ content });
  } catch {
    return response.status(502).json({ error: 'The AI service is unavailable.' });
  }
});

app.listen(port, () => {
  console.log(`AI proxy listening on port ${port}`);
});
