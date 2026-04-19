import {serve} from '@hono/node-server';
import {Hono} from 'hono';
import {cors} from 'hono/cors';
import {convertToModelMessages, streamText, type UIMessage} from 'ai';
import {createZhipu} from 'zhipu-ai-provider';
import llmModelRouter from './modules/llm-model/llm-model.controller.js';
import providerRouter from './modules/provider/provider.controller.js';
import metaMemoryRouter from './modules/meta-memory/meta-memory.controller.js';
import mbtiTypeRouter from './modules/mbti-type/mbti-type.controller.js';
import relationshipRouter from './modules/relationship/relationship.controller.js';
import agentTypeRouter from './modules/agent-type/agent-type.controller.js';
import agentRouter from './modules/agent/agent.controller.js';
import memoryTypeRouter from './modules/memory-type/memory-type.controller.js';
import sourceTypeRouter from './modules/source-type/source-type.controller.js';
import memoryStatusRouter from './modules/memory-status/memory-status.controller.js';
import longTermMemoryRouter from './modules/long-term-memory/long-term-memory.controller.js';
import taskStatusRouter from './modules/task-status/task-status.controller.js';
import taskMemoryRouter from './modules/task-memory/task-memory.controller.js';

const zhipu = createZhipu({
    apiKey: '4206c3ae4b4445a58c850148e78af383.Ud0tFTH6WuZb8TMt',
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

app.route('/api/llm-models', llmModelRouter);
app.route('/api/providers', providerRouter);
app.route('/api/meta-memory', metaMemoryRouter);
app.route('/api/mbti-types', mbtiTypeRouter);
app.route('/api/relationships', relationshipRouter);
app.route('/api/agent-types', agentTypeRouter);
app.route('/api/agents', agentRouter);
app.route('/api/memory-types', memoryTypeRouter);
app.route('/api/source-types', sourceTypeRouter);
app.route('/api/memory-statuses', memoryStatusRouter);
app.route('/api/long-term-memories', longTermMemoryRouter);
app.route('/api/task-statuses', taskStatusRouter);
app.route('/api/task-memories', taskMemoryRouter);

serve({fetch: app.fetch, port: 3001}, (info) => {
    console.log(`🤖 Sunday Agent server running at http://localhost:${info.port}`);
});
