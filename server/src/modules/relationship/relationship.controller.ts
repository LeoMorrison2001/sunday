import {Hono} from 'hono';
import * as svc from './relationship.service.js';

const router = new Hono();

router.get('/', (c) => {
    return c.json(svc.findAll());
});

export default router;
