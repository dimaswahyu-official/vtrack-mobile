import * as SQLite from 'expo-sqlite';
import {ActivitySog} from "./ActivitySogRepository";

export interface ActivityOutlet {
    id?: number;
    activity_id: number;
    label: string;
    value: number;
}


type OutletCreateParams = Omit<ActivityOutlet, 'id'>;

export const createTableActivityOutlet = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ActivityOutlet (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            activity_id INTEGER NOT NULL,
            label TEXT NOT NULL,
            value INTEGER NOT NULL,
            FOREIGN KEY (activity_id) REFERENCES Activity(id)
        )
    `);
};


// Model Untuk Outlet
export const OutletModel = {
    // Insert Into
    create: async (db: SQLite.SQLiteDatabase, params: OutletCreateParams): Promise<number> => {
        const {
            activity_id,
            label,
            value
        } = params;

        // Log the parameters to verify they are correct
        console.log('Inserting Outlet with parameters:', params);
        try {
            const result = await db.runAsync(
                `INSERT INTO ActivitySio (activity_id, label, value)
                 VALUES (?, ?, ?)`,
                [activity_id, label,value],
            );
            const insertId = result.lastInsertRowId as number;

            // Log the insertId to confirm successful insertion
            console.log('Activity Outlet inserted with ID:', insertId);
            return insertId;

        } catch (error) {
            console.error('Error inserting Activity Brand : ', error); // Log the error
            throw error; // Rethrow the error if needed
        }

    },
}