import db from '../../db/index.js';

export interface Provider {
    id: number;
    provider: string;
}

export function findAll(): Provider[] {
    return db.prepare('SELECT * FROM providers ORDER BY id').all() as unknown as Provider[];
}
