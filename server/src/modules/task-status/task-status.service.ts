import db from '../../db/index.js';

export interface TaskStatus {
    id: number;
    name: string;
}

export function findAll(): TaskStatus[] {
    return db.prepare('SELECT * FROM task_statuses ORDER BY id').all() as unknown as TaskStatus[];
}
