import * as SQLite from 'expo-sqlite';

type ActivitySio = {
    id: number;
    activity_id: number;
    name: string;
    description: string;
    notes: string;
    photo: string;
    photo_before: string;
    photo_after: string;
}

type SioCreateParams = Omit<ActivitySio, 'id'>;

export const createTableActivitySio = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    // await db.runAsync('DROP TABLE IF EXISTS ActivitySio');
    await db.execAsync(`
    PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS ActivitySio(
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        activity_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT, 
        notes TEXT,
        photo TEXT, 
        photo_before TEXT,
        photo_after TEXT,
        FOREIGN KEY ( activity_id ) REFERENCES Activity (id)
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
            photo_before,
            photo_after
        } = params;

        // Log the parameters to verify they are correct
        console.log('Inserting SIO with parameters:', params);
        try {
            const result = await db.runAsync(
                `INSERT INTO ActivitySio (activity_id, name, description, notes, photo, photo_before, photo_after)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [activity_id, name, description, notes, photo, photo_before, photo_after],
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
    // Get Activity by id
    getSioByScheduleId: async (db: SQLite.SQLiteDatabase, activity_id: number): Promise<ActivitySio[]> => {
        const query = `
            SELECT *
            FROM ActivitySio
            WHERE activity_id = ?
        `;

        const results = await db.getAllAsync(query, [activity_id]) as ActivitySio[];

        if (!results.length) {
            return []; // No activity found
        }

        // Transform the results into the desired format
        const activitySio= results.map(row => ({
            id: row.id,
            activity_id: row.activity_id,
            name: row.name,
            description: row.description,
            notes: row.notes,
            photo:row.photo,
            photo_before: row.photo_before,
            photo_after: row.photo_after,
        }));


        return activitySio;
    },
    updateStatusActivity: async (db: SQLite.SQLiteDatabase, photo_before: number, photo_after: any, activity_id: number): Promise<void> => {
        await db.runAsync(
            `UPDATE ActivitySio
             SET photo_before = ?,
                 photo_after  =?
             WHERE activity_id = ?;
            `, [photo_before, photo_after, activity_id]
        )

    }
}