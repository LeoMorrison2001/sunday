import db from '../../db/index.js';

export interface MemoryType {
    id: number;
    name: string;
}

export function findAll(): MemoryType[] {
    return db.prepare('SELECT * FROM memory_types ORDER BY id').all() as unknown as MemoryType[];
}
