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
    )
`);

// 初始化默认厂商
const count = (db.prepare('SELECT COUNT(*) as count FROM providers').get() as any).count;
if (count === 0) {
    const insert = db.prepare('INSERT INTO providers (provider) VALUES (?)');
    insert.run('openai');
    insert.run('anthropic');
    insert.run('google');
}

export default db;
