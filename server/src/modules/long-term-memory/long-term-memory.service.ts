import db from '../../db/index.js';

export interface LongTermMemory {
    id: number;
    content: string;
    type: string;
    source_type: string;
    source_id: string | null;
    tags: string | null;
    importance: number;
    emotional_valence: number;
    access_count: number;
    last_accessed_at: string | null;
    context_snapshot: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface CreateLongTermMemory {
    content: string;
    type: string;
}

export interface UpdateLongTermMemory {
    content?: string;
    type?: string;
    source_type?: string;
    source_id?: string;
    tags?: string;
    importance?: number;
    emotional_valence?: number;
    context_snapshot?: string;
    status?: string;
}

export function findAll(): LongTermMemory[] {
    return db.prepare('SELECT * FROM long_term_memories ORDER BY id DESC').all() as unknown as LongTermMemory[];
}

export function findById(id: number): LongTermMemory | undefined {
    return db.prepare('SELECT * FROM long_term_memories WHERE id = ?').get(id) as unknown as LongTermMemory | undefined;
}

export function create(data: CreateLongTermMemory): LongTermMemory {
    const stmt = db.prepare(
        `INSERT INTO long_term_memories (content, type, source_type, status, importance, emotional_valence, access_count)
         VALUES (?, ?, '用户输入', '活跃', 0, 0, 0)`
    );
    const info = stmt.run(data.content, data.type);
    return findById(info.lastInsertRowid as number)!;
}

export function update(id: number, data: UpdateLongTermMemory): LongTermMemory | undefined {
    const memory = findById(id);
    if (!memory) return undefined;

    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    }

    if (fields.length === 0) return memory;

    fields.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE long_term_memories SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return findById(id);
}

export function remove(id: number): boolean {
    const info = db.prepare('DELETE FROM long_term_memories WHERE id = ?').run(id);
    return info.changes > 0;
}
