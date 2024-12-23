import * as SQLite from 'expo-sqlite';

export interface ActivitySog {
    id?: number;
    activity_id: number;
    name: string;
    value: number;
    description: string;
    notes: string;
}

export const createTableActivitySog = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ActivitySog (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            activity_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            notes TEXT,
            FOREIGN KEY (activity_id) REFERENCES Activity(id)
        )
    `);
};