import * as SQLite from 'expo-sqlite';
import {ActivitySog} from "./ActivitySogRepository";

export interface ActivityBranch {
    id?: number;
    activity_id: number;
    name: string;
    value: number;
    description: string;
    notes: string;
}


type BrandCreateParams = Omit<ActivitySog, 'id'>;

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


// Model Untuk Brand
export const BrandModel = {
    // Insert Into
    create: async (db: SQLite.SQLiteDatabase, params: BrandCreateParams): Promise<number> => {
        const {
            activity_id,
            name,
            description,
            notes,
            value
        } = params;

        // Log the parameters to verify they are correct
        console.log('Inserting SOG with parameters:', params);
        try {
            const result = await db.runAsync(
                `INSERT INTO ActivitySio (activity_id, name, description, notes, value)
                 VALUES (?, ?, ?, ?,?)`,
                [activity_id, name, description, notes,value],
            );
            const insertId = result.lastInsertRowId as number;

            // Log the insertId to confirm successful insertion
            console.log('Activity Brand inserted with ID:', insertId);
            return insertId;

        } catch (error) {
            console.error('Error inserting Activity Brand : ', error); // Log the error
            throw error; // Rethrow the error if needed
        }

    },
}