import db from '../../db/index.js';

export interface Agent {
    id: number;
    agent_key: string;
    name: string;
    type: string;
    description: string;
    instance_count: number;
}

export interface CreateAgent {
    agent_key: string;
    name: string;
    type: string;
    description?: string;
}

export interface UpdateAgent {
    agent_key?: string;
    name?: string;
    type?: string;
    description?: string;
}

export function findAll(): Agent[] {
    return db.prepare('SELECT * FROM agents ORDER BY id').all() as unknown as Agent[];
}

export function findById(id: number): Agent | undefined {
    return db.prepare('SELECT * FROM agents WHERE id = ?').get(id) as unknown as Agent | undefined;
}

export function create(data: CreateAgent): Agent {
    const stmt = db.prepare('INSERT INTO agents (agent_key, name, type, description) VALUES (?, ?, ?, ?)');
    const info = stmt.run(data.agent_key, data.name, data.type, data.description ?? '');
    return findById(info.lastInsertRowid as number)!;
}

export function update(id: number, data: UpdateAgent): Agent | undefined {
    const agent = findById(id);
    if (!agent) return undefined;
    const updated = {
        agent_key: data.agent_key ?? agent.agent_key,
        name: data.name ?? agent.name,
        type: data.type ?? agent.type,
        description: data.description ?? agent.description,
    };
    db.prepare('UPDATE agents SET agent_key = ?, name = ?, type = ?, description = ? WHERE id = ?')
        .run(updated.agent_key, updated.name, updated.type, updated.description, id);
    return findById(id);
}

export function remove(id: number): boolean {
    const info = db.prepare('DELETE FROM agents WHERE id = ?').run(id);
    return info.changes > 0;
}
