import {Hono} from 'hono';
import * as svc from './memory-status.service.js';

const router = new Hono();

router.get('/', (c) => {
    return c.json(svc.findAll());
});

export default router;
