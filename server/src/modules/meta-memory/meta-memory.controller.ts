import {Hono} from 'hono';
import * as svc from './meta-memory.service.js';

const router = new Hono();

router.get('/', (c) => {
    const data = svc.find();
    return c.json(data ?? {});
});

router.put('/', async (c) => {
    const body = await c.req.json();
    const data = svc.upsert(body);
    return c.json(data);
});

export default router;
