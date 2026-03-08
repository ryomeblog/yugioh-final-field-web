import { openDB as idbOpenDB, type IDBPDatabase } from "idb";
import type { Combo, CachedImage } from "@/types";

const DB_NAME = "yugioh-combo-db";
const DB_VERSION = 1;

function getDB(): Promise<IDBPDatabase> {
  return idbOpenDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("combos")) {
        db.createObjectStore("combos", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { keyPath: "id" });
      }
    },
  });
}

// Combos CRUD
export async function getAllCombos(): Promise<Combo[]> {
  const db = await getDB();
  return db.getAll("combos");
}

export async function getCombo(id: string): Promise<Combo | undefined> {
  const db = await getDB();
  return db.get("combos", id);
}

export async function putCombo(combo: Combo): Promise<void> {
  const db = await getDB();
  await db.put("combos", combo);
}

export async function deleteCombo(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("combos", id);
}

// Images CRUD
export async function getAllImages(): Promise<CachedImage[]> {
  const db = await getDB();
  return db.getAll("images");
}

export async function getImage(id: string): Promise<CachedImage | undefined> {
  const db = await getDB();
  return db.get("images", id);
}

export async function putImage(image: CachedImage): Promise<void> {
  const db = await getDB();
  await db.put("images", image);
}

export async function deleteImage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("images", id);
}
