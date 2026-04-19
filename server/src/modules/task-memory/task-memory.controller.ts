import {Hono} from 'hono';
import * as svc from './task-memory.service.js';

const router = new Hono();

router.get('/', (c) => {
    return c.json(svc.findAll());
});

router.get('/:id', (c) => {
    const task = svc.findById(Number(c.req.param('id')));
    if (!task) return c.json({error: '未找到该任务'}, 404);
    return c.json(task);
});

router.post('/', async (c) => {
    const body = await c.req.json();
    const {content, cron_expression} = body;
    if (!content || !cron_expression) {
        return c.json({error: 'content、cron_expression 为必填项'}, 400);
    }
    const task = svc.create(body);
    return c.json(task, 201);
});

router.put('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const task = svc.update(id, body);
    if (!task) return c.json({error: '未找到该任务'}, 404);
    return c.json(task);
});

router.delete('/:id', (c) => {
    const ok = svc.remove(Number(c.req.param('id')));
    if (!ok) return c.json({error: '未找到该任务'}, 404);
    return c.json({ok: true});
});

export default router;
