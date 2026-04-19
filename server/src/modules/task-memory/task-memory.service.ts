import db from '../../db/index.js';

export interface TaskMemory {
    id: number;
    content: string;
    cron_expression: string;
    status: string;
    execution_count: number;
    created_at: string;
    updated_at: string;
}

export interface CreateTaskMemory {
    content: string;
    cron_expression: string;
}

export interface UpdateTaskMemory {
    content?: string;
    cron_expression?: string;
    status?: string;
}

export function findAll(): TaskMemory[] {
    return db.prepare('SELECT * FROM task_memories ORDER BY id DESC').all() as unknown as TaskMemory[];
}

export function findById(id: number): TaskMemory | undefined {
    return db.prepare('SELECT * FROM task_memories WHERE id = ?').get(id) as unknown as TaskMemory | undefined;
}

export function create(data: CreateTaskMemory): TaskMemory {
    const stmt = db.prepare(
        "INSERT INTO task_memories (content, cron_expression, status, execution_count) VALUES (?, ?, '启用', 0)"
    );
    const info = stmt.run(data.content, data.cron_expression);
    return findById(info.lastInsertRowid as number)!;
}

export function update(id: number, data: UpdateTaskMemory): TaskMemory | undefined {
    const task = findById(id);
    if (!task) return undefined;

    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    }

    if (fields.length === 0) return task;

    fields.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE task_memories SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return findById(id);
}

export function remove(id: number): boolean {
    const info = db.prepare('DELETE FROM task_memories WHERE id = ?').run(id);
    return info.changes > 0;
}
