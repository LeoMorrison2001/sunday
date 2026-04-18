import {Hono} from 'hono';
import * as svc from './long-term-memory.service.js';

const router = new Hono();

router.get('/', (c) => {
    return c.json(svc.findAll());
});

router.get('/:id', (c) => {
    const memory = svc.findById(Number(c.req.param('id')));
    if (!memory) return c.json({error: '未找到该记忆'}, 404);
    return c.json(memory);
});

router.post('/', async (c) => {
    const body = await c.req.json();
    const {content, type} = body;
    if (!content || !type) {
        return c.json({error: 'content、type 为必填项'}, 400);
    }
    const memory = svc.create(body);
    return c.json(memory, 201);
});

router.put('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const memory = svc.update(id, body);
    if (!memory) return c.json({error: '未找到该记忆'}, 404);
    return c.json(memory);
});

router.delete('/:id', (c) => {
    const ok = svc.remove(Number(c.req.param('id')));
    if (!ok) return c.json({error: '未找到该记忆'}, 404);
    return c.json({ok: true});
});

export default router;
