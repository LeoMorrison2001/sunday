import db from '../../db/index.js';

export interface LlmModel {
    id: number;
    provider: string;
    model_identifier: string;
    api_key: string;
}

export interface CreateLlmModel {
    provider: string;
    model_identifier: string;
    api_key: string;
}

export interface UpdateLlmModel {
    provider?: string;
    model_identifier?: string;
    api_key?: string;
}

export function findAll(): LlmModel[] {
    return db.prepare('SELECT * FROM llm_models ORDER BY id').all() as unknown as LlmModel[];
}

export function findById(id: number): LlmModel | undefined {
    return db.prepare('SELECT * FROM llm_models WHERE id = ?').get(id) as unknown as LlmModel | undefined;
}

export function create(data: CreateLlmModel): LlmModel {
    const stmt = db.prepare('INSERT INTO llm_models (provider, model_identifier, api_key) VALUES (?, ?, ?)');
    const info = stmt.run(data.provider, data.model_identifier, data.api_key);
    return findById(info.lastInsertRowid as number)!;
}

export function update(id: number, data: UpdateLlmModel): LlmModel | undefined {
    const model = findById(id);
    if (!model) return undefined;
    const updated = {
        provider: data.provider ?? model.provider,
        model_identifier: data.model_identifier ?? model.model_identifier,
        api_key: data.api_key ?? model.api_key,
    };
    db.prepare('UPDATE llm_models SET provider = ?, model_identifier = ?, api_key = ? WHERE id = ?')
        .run(updated.provider, updated.model_identifier, updated.api_key, id);
    return findById(id);
}

export function remove(id: number): boolean {
    const info = db.prepare('DELETE FROM llm_models WHERE id = ?').run(id);
    return info.changes > 0;
}
