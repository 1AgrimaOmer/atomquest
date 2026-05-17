import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';
import { seedData } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, 'data.json');
const collections = ['users', 'goals', 'checkins', 'audits', 'notifications', 'escalations'];

let mongo = null;

const clone = (value) => JSON.parse(JSON.stringify(value));

export async function initStore() {
  if (process.env.MONGO_URI) {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db(process.env.MONGO_DB || 'atomquest_goalos');
    mongo = { client, db };
    for (const name of collections) {
      if ((await db.collection(name).countDocuments()) === 0) {
        await db.collection(name).insertMany(clone(seedData[name]));
      }
    }
    return 'mongodb';
  }

  try {
    await fs.access(dataPath);
  } catch {
    await fs.writeFile(dataPath, JSON.stringify(seedData, null, 2));
  }
  return 'json';
}

async function readJson() {
  return JSON.parse(await fs.readFile(dataPath, 'utf8'));
}

async function writeJson(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
}

export async function all(name) {
  if (mongo) return mongo.db.collection(name).find({}, { projection: { _id: 0 } }).toArray();
  const data = await readJson();
  return data[name] || [];
}

export async function replaceAll(name, records) {
  if (mongo) {
    await mongo.db.collection(name).deleteMany({});
    if (records.length) await mongo.db.collection(name).insertMany(clone(records));
    return;
  }
  const data = await readJson();
  data[name] = records;
  await writeJson(data);
}

export async function mutate(mutator) {
  if (mongo) {
    const data = {};
    for (const name of collections) data[name] = await all(name);
    const result = await mutator(data);
    for (const name of collections) await replaceAll(name, data[name]);
    return result;
  }

  const data = await readJson();
  const result = await mutator(data);
  await writeJson(data);
  return result;
}
