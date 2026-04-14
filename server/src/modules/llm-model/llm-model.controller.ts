import {Hono} from 'hono';
import * as svc from './llm-model.service.js';

const router = new Hono();

router.get('/', (c) => {
    return c.json(svc.findAll());
});

router.get('/:id', (c) => {
    const model = svc.findById(Number(c.req.param('id')));
    if (!model) return c.json({error: '未找到该模型'}, 404);
    return c.json(model);
});

router.post('/', async (c) => {
    const body = await c.req.json();
    const {provider, model_identifier, api_key} = body;
    if (!provider || !model_identifier || !api_key) {
        return c.json({error: 'provider、model_identifier、api_key 为必填项'}, 400);
    }
    try {
        const model = svc.create({provider, model_identifier, api_key});
        return c.json(model, 201);
    } catch (e: any) {
        if (e.message?.includes('UNIQUE')) {
            return c.json({error: '模型标识已存在'}, 409);
        }
        throw e;
    }
});

router.put('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const model = svc.update(id, body);
    if (!model) return c.json({error: '未找到该模型'}, 404);
    return c.json(model);
});

router.delete('/:id', (c) => {
    const ok = svc.remove(Number(c.req.param('id')));
    if (!ok) return c.json({error: '未找到该模型'}, 404);
    return c.json({ok: true});
});

export default router;
