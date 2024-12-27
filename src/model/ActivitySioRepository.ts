import * as SQLite from 'expo-sqlite';

export interface ActivitySio {
    id?: number;
    activity_id: number;
    name: string;
    description: string;
    notes: string;
    photo: string;
}

type SioCreateParams = Omit<ActivitySio, 'id'>;

export const createTableActivitySio = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ActivitySio
        (
            id
            INTEGER
            PRIMARY
            KEY
            AUTOINCREMENT
            NOT
            NULL,
            activity_id
            INTEGER
            NOT
            NULL,
            name
            TEXT
            NOT
            NULL,
            description
            TEXT,
            notes
            TEXT,
            photo
            TEXT,
            FOREIGN
            KEY
        (
            activity_id
        ) REFERENCES Activity
        (
            id
        )
            )
    `);
};
// Model Untuk SIO
export const SioModel = {
    // Insert Into
    create: async (db: SQLite.SQLiteDatabase, params: SioCreateParams): Promise<number> => {
        const {
            activity_id,
            name,
            description,
            notes,
            photo,
        } = params;

        // Log the parameters to verify they are correct
        console.log('Inserting SIO with parameters:', params);
        try {
            const result = await db.runAsync(
                `INSERT INTO ActivitySio (activity_id, name, description, notes, photo)
                 VALUES (?, ?, ?, ?, ?)`,
                [activity_id, name, description, notes, photo],
            );
            const insertId = result.lastInsertRowId as number;

            // Log the insertId to confirm successful insertion
            console.log('Activity SIO inserted with ID:', insertId);
            return insertId;

        } catch (error) {
            console.error('Error inserting Activity SIO : ', error); // Log the error
            throw error; // Rethrow the error if needed
        }

    },

}