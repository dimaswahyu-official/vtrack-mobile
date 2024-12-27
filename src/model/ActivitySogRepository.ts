import * as SQLite from 'expo-sqlite';
import {ActivitySio} from "./ActivitySioRepository";

export interface ActivitySog {
    id?: number;
    activity_id: number;
    name: string;
    value: number;
    description: string;
    notes: string;
}


type SogCreateParams = Omit<ActivitySog, 'id'>;

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

// Model Untuk SOG
export const SogModel = {
    // Insert Into
    create: async (db: SQLite.SQLiteDatabase, params: SogCreateParams): Promise<number> => {
        const {
            activity_id,
            name,
            description,
            notes,
        } = params;

        // Log the parameters to verify they are correct
        console.log('Inserting SOG with parameters:', params);
        try {
            const result = await db.runAsync(
                `INSERT INTO ActivitySog (activity_id, name, description, notes)
                 VALUES (?, ?, ?, ?)`,
                [activity_id, name, description, notes,],
            );
            const insertId = result.lastInsertRowId as number;

            // Log the insertId to confirm successful insertion
            console.log('Activity SOG inserted with ID:', insertId);
            return insertId;

        } catch (error) {
            console.error('Error inserting Activity SOG : ', error); // Log the error
            throw error; // Rethrow the error if needed
        }

    },
}