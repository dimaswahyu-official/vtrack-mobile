import * as SQLite from 'expo-sqlite';

export interface ActivitySio {
    id?: number;
    activity_id: number;
    name: string;
    description: string;
    notes: string;
    photo: string;
}

export const createTableActivitySio = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ActivitySio (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            activity_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            notes TEXT,
            photo TEXT,
            FOREIGN KEY (activity_id) REFERENCES Activity(id)
        )
    `);
};