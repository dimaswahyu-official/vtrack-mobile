import * as SQLite from 'expo-sqlite';

export interface ActivityProgram {
    id?: number;
    call_plan_schedule_id: number;
    name: string;
    description: string;
    photo: string;
    is_sync: number;
}


type ActivityProgramCreateParams = Omit<ActivityProgram, 'id'>;
type ActivityProgramUpdateParams = Partial<ActivityProgram>;

export const createTableActivityProgram = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ActivityProgram (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            call_plan_schedule_id INTEGER NOT NULL,
            name TEXT,
            photo TEXT,
            description TEXT,
            is_sync INTEGER DEFAULT 0,
            FOREIGN KEY (call_plan_schedule_id) REFERENCES Activity(call_plan_schedule_id)
        )
    `);
};


export const ActivityProgramModel = {
    // Insert Into
    create: async (db: SQLite.SQLiteDatabase, params: ActivityProgramCreateParams): Promise<number> => {
        const {
            call_plan_schedule_id,
            name,
            description,
            photo,
            is_sync
        } = params;

        // Log the parameters to verify they are correct
        console.log('Inserting Activity Program with parameters:', params);
        try {
            const result = await db.runAsync(
                `INSERT INTO ActivityProgram (call_plan_schedule_id, name, description, photo, is_sync)
                 VALUES (?, ?, ?, ?, ?)`,
                [call_plan_schedule_id, name, description, photo, is_sync]
            );
            const insertId = result.lastInsertRowId as number;

            // Log the insertId to confirm successful insertion
            console.log('Activity Program inserted with ID:', insertId);
            return insertId;

        } catch (error) {
            console.error('Error inserting Activity Program : ', error);
            throw error;
        }

    },

    update: async (
		db: SQLite.SQLiteDatabase,
		params: ActivityProgramUpdateParams
	): Promise<void> => {
		if (!params.id) {
			throw new Error('id is required for update');
		}

		const entries = Object.entries(params).filter(
			([key]) => key !== 'id'
		);

		if (entries.length === 0) {
			return;
		}

		const fields = entries.map(([key]) => `${key} = ?`).join(', ');
		const values = entries.map(([_, value]) => value);

		await db.runAsync(
			`UPDATE ActivityProgram SET ${fields} WHERE id = ?`,
			[...values, params.id]
		);
	},

    findByCallPlanScheduleId: async (db: SQLite.SQLiteDatabase, call_plan_schedule_id: number): Promise<ActivityProgram[]> => {
		const result = await db.getAllAsync<ActivityProgram>(
			`SELECT * FROM ActivityProgram WHERE call_plan_schedule_id = ?`,
			[call_plan_schedule_id]
		);
		return result;
	},

    delete: async (db: SQLite.SQLiteDatabase, id: number): Promise<void> => {
        await db.runAsync(`DELETE FROM ActivityProgram WHERE id = ?`, [id]);
    },
}