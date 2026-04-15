import db from '../../db/index.js';

export interface MbtiType {
    id: number;
    name: string;
}

export function findAll(): MbtiType[] {
    return db.prepare('SELECT * FROM mbti_types ORDER BY id').all() as unknown as MbtiType[];
}
