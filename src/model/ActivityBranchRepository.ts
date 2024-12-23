import * as SQLite from 'expo-sqlite';

export interface ActivityBranch {
    id?: number;
    activity_id: number;
    name: string;
    value: number;
    description: string;
    notes: string;
}

export const createTableActivityBranch = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ActivityBranch (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            activity_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            value INTEGER NOT NULL,
            description TEXT,
            notes TEXT,
            FOREIGN KEY (activity_id) REFERENCES Activity(id)
        )
    `);
};