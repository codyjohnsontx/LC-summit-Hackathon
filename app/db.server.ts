import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

// --- Data Types --------------------------------------------------
export interface User {
  id: string;
  username: string;
  password: string; // NOTE: Plain-text for MVP, DO NOT use in production
}

export interface CoffeeShop {
  id: string;
  name: string;
  location?: string;
  createdBy: string; // user id
  votes?: Record<string, 1 | -1>; // userId -> vote
}

export interface SpeedTest {
  id: string;
  coffeeShopId: string;
  download: number;
  upload: number;
  createdAt: string;
  createdBy: string; // user id
}

export interface DBData {
  users: User[];
  coffeeShops: CoffeeShop[];
  speedTests: SpeedTest[];
}

// --- Singleton DB ------------------------------------------------
const dbFile = path.resolve(process.cwd(), 'db/db.json');
const adapter = new JSONFile<DBData>(dbFile);
const db = new Low<DBData>(adapter, {
  users: [],
  coffeeShops: [],
  speedTests: [],
});

// Ensure we read the file at least once per import
let hasRead = false;
async function ensureRead() {
  if (!hasRead) {
    await db.read();
    db.data ||= { users: [], coffeeShops: [], speedTests: [] };
    hasRead = true;
  }
}

// Convenience helpers --------------------------------------------
export async function getUserByUsername(username: string) {
  await ensureRead();
  return db.data!.users.find((u: User) => u.username === username);
}

export async function createUser(username: string, password: string) {
  await ensureRead();
  const user = { id: randomUUID(), username, password } satisfies User;
  db.data!.users.push(user);
  await db.write();
  return user;
}

export async function getUserById(id: string) {
  await ensureRead();
  return db.data!.users.find((u: User) => u.id === id);
}

export async function getCoffeeShops() {
  await ensureRead();
  return db.data!.coffeeShops;
}

export async function createCoffeeShop(
  name: string,
  location: string | undefined,
  createdBy: string
) {
  await ensureRead();
  const shop = {
    id: randomUUID(),
    name,
    location,
    createdBy,
  } satisfies CoffeeShop;
  db.data!.coffeeShops.push(shop);
  await db.write();
  return shop;
}

export async function getCoffeeShop(id: string) {
  await ensureRead();
  return db.data!.coffeeShops.find((s: CoffeeShop) => s.id === id);
}

export async function getSpeedTestsForShop(shopId: string) {
  await ensureRead();
  return db.data!.speedTests.filter(
    (t: SpeedTest) => t.coffeeShopId === shopId
  );
}

export async function addSpeedTest(
  coffeeShopId: string,
  download: number,
  upload: number,
  createdBy: string
) {
  await ensureRead();
  const test: SpeedTest = {
    id: randomUUID(),
    coffeeShopId,
    download,
    upload,
    createdAt: new Date().toISOString(),
    createdBy,
  };
  db.data!.speedTests.push(test);
  await db.write();
  return test;
}

export async function voteCoffeeShop(
  shopId: string,
  userId: string,
  vote: 'up' | 'down'
) {
  await ensureRead();
  const shop = db.data!.coffeeShops.find((s: CoffeeShop) => s.id === shopId);
  if (!shop) return null;
  if (!shop.votes) shop.votes = {};
  shop.votes[userId] = vote === 'up' ? 1 : -1;
  await db.write();
  return shop;
}

export function countVotes(shop: CoffeeShop) {
  const values = shop.votes ? Object.values(shop.votes) : [];
  const up = values.filter((v) => v === 1).length;
  const down = values.filter((v) => v === -1).length;
  return { up, down };
}

export { randomUUID };
