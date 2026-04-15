import db from '../../db/index.js';

export interface MetaMemory {
    id: number;
    imprint: string;
    model_id: number | null;
    personality: string;
    birth_date_time: string | null;
    relationship: string;
}

export interface UpsertMetaMemory {
    imprint?: string;
    model_id?: number | null;
    personality?: string;
    birth_date_time?: string | null;
    relationship?: string;
}

export function find(): MetaMemory | null {
    return db.prepare('SELECT * FROM meta_memory LIMIT 1').get() as MetaMemory | null ?? null;
}

export function upsert(data: UpsertMetaMemory): MetaMemory {
    const existing = find();
    if (existing) {
        const updated = {
            imprint: data.imprint ?? existing.imprint,
            model_id: data.model_id ?? existing.model_id,
            personality: data.personality ?? existing.personality,
            birth_date_time: data.birth_date_time ?? existing.birth_date_time,
            relationship: data.relationship ?? existing.relationship,
        };
        db.prepare(
            'UPDATE meta_memory SET imprint = ?, model_id = ?, personality = ?, birth_date_time = ?, relationship = ? WHERE id = ?'
        ).run(updated.imprint, updated.model_id, updated.personality, updated.birth_date_time, updated.relationship, existing.id);
        return {...existing, ...updated};
    }
    const stmt = db.prepare(
        'INSERT INTO meta_memory (imprint, model_id, personality, birth_date_time, relationship) VALUES (?, ?, ?, ?, ?)'
    );
    const info = stmt.run(data.imprint ?? '', data.model_id ?? null, data.personality ?? '', data.birth_date_time ?? null, data.relationship ?? '');
    return {
        id: info.lastInsertRowid as number,
        imprint: data.imprint ?? '',
        model_id: data.model_id ?? null,
        personality: data.personality ?? '',
        birth_date_time: data.birth_date_time ?? null,
        relationship: data.relationship ?? ''
    };
}
