import {Hono} from 'hono';
import * as svc from './agent.service.js';

const router = new Hono();

router.get('/', (c) => {
    return c.json(svc.findAll());
});

router.get('/:id', (c) => {
    const agent = svc.findById(Number(c.req.param('id')));
    if (!agent) return c.json({error: '未找到该智能体'}, 404);
    return c.json(agent);
});

router.post('/', async (c) => {
    const body = await c.req.json();
    const {agent_key, name, type} = body;
    if (!agent_key || !name || !type) {
        return c.json({error: 'agent_key、name、type 为必填项'}, 400);
    }
    try {
        const agent = svc.create(body);
        return c.json(agent, 201);
    } catch (e: any) {
        if (e.message?.includes('UNIQUE')) {
            return c.json({error: '智能体KEY已存在'}, 409);
        }
        throw e;
    }
});

router.put('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const agent = svc.update(id, body);
    if (!agent) return c.json({error: '未找到该智能体'}, 404);
    return c.json(agent);
});

router.delete('/:id', (c) => {
    const ok = svc.remove(Number(c.req.param('id')));
    if (!ok) return c.json({error: '未找到该智能体'}, 404);
    return c.json({ok: true});
});

export default router;
