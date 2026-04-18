import db from '../../db/index.js';

export interface MemoryStatus {
    id: number;
    name: string;
}

export function findAll(): MemoryStatus[] {
    return db.prepare('SELECT * FROM memory_statuses ORDER BY id').all() as unknown as MemoryStatus[];
}
