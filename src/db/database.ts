import * as SQLite from 'expo-sqlite';
import { Trip, TripDocument, TravelCard } from '../types';

const db = SQLite.openDatabaseSync('tripwallet.db');

db.execSync(`
  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    startLocation TEXT NOT NULL,
    endLocation TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS trip_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tripId INTEGER NOT NULL,
    name TEXT NOT NULL,
    localPath TEXT NOT NULL,
    mimeType TEXT NOT NULL,
    size INTEGER NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS travel_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    imagePath TEXT NOT NULL,
    fileType TEXT NOT NULL DEFAULT 'image',
    createdAt TEXT NOT NULL
  );
`);

// migration: add fileType column to existing travel_cards tables
try {
  db.execSync("ALTER TABLE travel_cards ADD COLUMN fileType TEXT NOT NULL DEFAULT 'image'");
} catch {
  // column already exists
}

// migration: remove old 'type' column (rename table → recreate → copy → drop old)
{
  const cols = db.getAllSync<{ name: string }>('PRAGMA table_info(travel_cards)');
  if (cols.some(c => c.name === 'type')) {
    db.execSync('ALTER TABLE travel_cards RENAME TO travel_cards_legacy');
    db.execSync(`CREATE TABLE travel_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      imagePath TEXT NOT NULL,
      fileType TEXT NOT NULL DEFAULT 'image',
      createdAt TEXT NOT NULL
    )`);
    try {
      db.execSync(
        "INSERT INTO travel_cards (id, label, imagePath, fileType, createdAt) SELECT id, label, imagePath, 'image', createdAt FROM travel_cards_legacy"
      );
    } catch { /* no existing rows or missing columns — safe to skip */ }
    db.execSync('DROP TABLE IF EXISTS travel_cards_legacy');
  }
}

export function insertTrip(trip: Omit<Trip, 'id'>): number {
  const result = db.runSync(
    `INSERT INTO trips (name, startLocation, endLocation, startDate, endDate, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [trip.name, trip.startLocation, trip.endLocation, trip.startDate, trip.endDate, trip.createdAt]
  );
  return result.lastInsertRowId;
}

export function getAllTrips(): Trip[] {
  return db.getAllSync<Trip>('SELECT * FROM trips ORDER BY startDate ASC');
}

export function getTripById(id: number): Trip | null {
  return db.getFirstSync<Trip>('SELECT * FROM trips WHERE id = ?', [id]) ?? null;
}

export function deleteTrip(id: number) {
  db.runSync('DELETE FROM trips WHERE id = ?', [id]);
}

export function insertDocument(doc: Omit<TripDocument, 'id'>): number {
  const result = db.runSync(
    `INSERT INTO trip_documents (tripId, name, localPath, mimeType, size, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [doc.tripId, doc.name, doc.localPath, doc.mimeType, doc.size, doc.createdAt]
  );
  return result.lastInsertRowId;
}

export function getDocumentsByTrip(tripId: number): TripDocument[] {
  return db.getAllSync<TripDocument>(
    'SELECT * FROM trip_documents WHERE tripId = ? ORDER BY createdAt ASC',
    [tripId]
  );
}

export function deleteDocument(id: number) {
  db.runSync('DELETE FROM trip_documents WHERE id = ?', [id]);
}

export function insertCard(card: Omit<TravelCard, 'id'>): number {
  const result = db.runSync(
    `INSERT INTO travel_cards (label, imagePath, fileType, createdAt)
     VALUES (?, ?, ?, ?)`,
    [card.label, card.imagePath, card.fileType, card.createdAt]
  );
  return result.lastInsertRowId;
}

export function getAllCards(): TravelCard[] {
  return db.getAllSync<TravelCard>('SELECT * FROM travel_cards ORDER BY createdAt DESC');
}

export function getCardById(id: number): TravelCard | null {
  return db.getFirstSync<TravelCard>('SELECT * FROM travel_cards WHERE id = ?', [id]) ?? null;
}

export function deleteCard(id: number) {
  db.runSync('DELETE FROM travel_cards WHERE id = ?', [id]);
}
