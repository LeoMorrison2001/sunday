import {DatabaseSync} from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../../data');
const dbPath = path.join(dataDir, 'sunday.db');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, {recursive: true});
}

const db = new DatabaseSync(dbPath);

// 开启 WAL 模式，提升并发读写性能
db.exec('PRAGMA journal_mode = WAL');

// 建表
db.exec(`
    CREATE TABLE IF NOT EXISTS providers
    (
        id
        INTEGER
        PRIMARY
        KEY
        AUTOINCREMENT,
        provider
        TEXT
        UNIQUE
        NOT
        NULL
    );

    CREATE TABLE IF NOT EXISTS llm_models
    (
        id
        INTEGER
        PRIMARY
        KEY
        AUTOINCREMENT,
        provider
        TEXT
        NOT
        NULL,
        model_identifier
        TEXT
        UNIQUE
        NOT
        NULL,
        api_key
        TEXT
        NOT
        NULL
    );

    CREATE TABLE IF NOT EXISTS meta_memory
    (
        id
        INTEGER
        PRIMARY
        KEY
        AUTOINCREMENT,
        imprint
        TEXT
        NOT
        NULL
        DEFAULT
        '',
        model_id
        INTEGER,
        personality
        TEXT
        NOT
        NULL
        DEFAULT
        '',
        birth_date_time
        TEXT,
        relationship
        TEXT
        NOT
        NULL
        DEFAULT
        ''
    );

    CREATE TABLE IF NOT EXISTS mbti_types
    (
        id
        INTEGER
        PRIMARY
        KEY
        AUTOINCREMENT,
        name
        TEXT
        UNIQUE
        NOT
        NULL
    );

    CREATE TABLE IF NOT EXISTS relationships
    (
        id
        INTEGER
        PRIMARY
        KEY
        AUTOINCREMENT,
        name
        TEXT
        UNIQUE
        NOT
        NULL
    );

    CREATE TABLE IF NOT EXISTS agent_types
    (
        id
        INTEGER
        PRIMARY
        KEY
        AUTOINCREMENT,
        name
        TEXT
        UNIQUE
        NOT
        NULL
    );

    CREATE TABLE IF NOT EXISTS agents
    (
        id
        INTEGER
        PRIMARY
        KEY
        AUTOINCREMENT,
        agent_key
        TEXT
        UNIQUE
        NOT
        NULL,
        name
        TEXT
        NOT
        NULL,
        type
        TEXT
        NOT
        NULL,
        description
        TEXT
        NOT
        NULL
        DEFAULT
        '',
        instance_count
        INTEGER
        NOT
        NULL
        DEFAULT
        0
    );

    CREATE TABLE IF NOT EXISTS memory_types
    (
        id
        INTEGER
        PRIMARY
        KEY
        AUTOINCREMENT,
        name
        TEXT
        UNIQUE
        NOT
        NULL
    );

    CREATE TABLE IF NOT EXISTS source_types
    (
        id
        INTEGER
        PRIMARY
        KEY
        AUTOINCREMENT,
        name
        TEXT
        UNIQUE
        NOT
        NULL
    );

    CREATE TABLE IF NOT EXISTS memory_statuses
    (
        id
        INTEGER
        PRIMARY
        KEY
        AUTOINCREMENT,
        name
        TEXT
        UNIQUE
        NOT
        NULL
    )
`);

// 初始化默认厂商
const providerCount = (db.prepare('SELECT COUNT(*) as count FROM providers').get() as any).count;
if (providerCount === 0) {
    const insert = db.prepare('INSERT INTO providers (provider) VALUES (?)');
    insert.run('openai');
    insert.run('anthropic');
    insert.run('google');
}

// 初始化 MBTI 类型
const mbtiCount = (db.prepare('SELECT COUNT(*) as count FROM mbti_types').get() as any).count;
if (mbtiCount === 0) {
    const insert = db.prepare('INSERT INTO mbti_types (name) VALUES (?)');
    ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
    ].forEach(t => insert.run(t));
}

// 初始化关系角色
const relCount = (db.prepare('SELECT COUNT(*) as count FROM relationships').get() as any).count;
if (relCount === 0) {
    const insert = db.prepare('INSERT INTO relationships (name) VALUES (?)');
    ['主人', '爸爸', '妈妈', '朋友', '老师', '伴侣', '同事', '导师', '学生'].forEach(r => insert.run(r));
}

// 初始化智能体类型
const agentTypeCount = (db.prepare('SELECT COUNT(*) as count FROM agent_types').get() as any).count;
if (agentTypeCount === 0) {
    const insert = db.prepare('INSERT INTO agent_types (name) VALUES (?)');
    ['对话型', '任务型', '工具型', '工作流型'].forEach(t => insert.run(t));
}

// 初始化记忆类型
const memoryTypeCount = (db.prepare('SELECT COUNT(*) as count FROM memory_types').get() as any).count;
if (memoryTypeCount === 0) {
    const insert = db.prepare('INSERT INTO memory_types (name) VALUES (?)');
    ['情景记忆', '语义记忆', '技能记忆'].forEach(t => insert.run(t));
}

// 初始化来源类型
const sourceTypeCount = (db.prepare('SELECT COUNT(*) as count FROM source_types').get() as any).count;
if (sourceTypeCount === 0) {
    const insert = db.prepare('INSERT INTO source_types (name) VALUES (?)');
    ['对话提取', '用户输入', '智能体归纳', '反思'].forEach(t => insert.run(t));
}

// 初始化记忆状态
const memoryStatusCount = (db.prepare('SELECT COUNT(*) as count FROM memory_statuses').get() as any).count;
if (memoryStatusCount === 0) {
    const insert = db.prepare('INSERT INTO memory_statuses (name) VALUES (?)');
    ['活跃', '衰减', '归档'].forEach(t => insert.run(t));
}

export default db;
