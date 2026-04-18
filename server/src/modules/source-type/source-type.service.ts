import db from '../../db/index.js';

export interface SourceType {
    id: number;
    name: string;
}

export function findAll(): SourceType[] {
    return db.prepare('SELECT * FROM source_types ORDER BY id').all() as unknown as SourceType[];
}
