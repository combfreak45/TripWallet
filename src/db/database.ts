import * as SQLite from 'expo-sqlite';
import { Trip, TripDocument } from '../types';

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
`);

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
