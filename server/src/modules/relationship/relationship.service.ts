import db from '../../db/index.js';

export interface Relationship {
    id: number;
    name: string;
}

export function findAll(): Relationship[] {
    return db.prepare('SELECT * FROM relationships ORDER BY id').all() as unknown as Relationship[];
}
