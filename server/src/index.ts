import {serve} from '@hono/node-server';
import {Hono} from 'hono';
import {cors} from 'hono/cors';
import {convertToModelMessages, streamText, type UIMessage} from 'ai';
import {createZhipu} from 'zhipu-ai-provider';

const zhipu = createZhipu({
    apiKey: '',
    baseURL: 'https://open.bigmodel.cn/api/coding/paas/v4',
});

const app = new Hono();

app.use('/api/*', cors({origin: ['http://localhost:5173']}));

app.post('/api/chat', async (c) => {
    const {messages}: { messages: UIMessage[] } = await c.req.json();
    const result = streamText({
        model: zhipu('glm-4.7'),
        messages: await convertToModelMessages(messages),
    });
    return result.toUIMessageStreamResponse();
});

serve({fetch: app.fetch, port: 3001}, (info) => {
    console.log(`🤖 Sunday Agent server running at http://localhost:${info.port}`);
});
