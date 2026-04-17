import db from '../../db/index.js';

export interface AgentType {
    id: number;
    name: string;
}

export function findAll(): AgentType[] {
    return db.prepare('SELECT * FROM agent_types ORDER BY id').all() as unknown as AgentType[];
}
