import * as SQLite from 'expo-sqlite';

export interface ActivitySog {
    id?: number;
    call_plan_schedule_id: number;
    name: string;
    value: number;
    description: string;
    notes: string;
}


type ActivitySogCreateParams = Omit<ActivitySog, 'id'>;
type ActivitySogUpdateParams = Partial<ActivitySog>;

export const createTableActivitySog = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ActivitySog (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            call_plan_schedule_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            value INTEGER NOT NULL,
            description TEXT,
            notes TEXT,
            FOREIGN KEY (call_plan_schedule_id) REFERENCES Activity(call_plan_schedule_id)
        )
    `);
};

// Model Untuk SOG
export const ActivitySogModel = {
    // Insert Into
    create: async (db: SQLite.SQLiteDatabase, params: ActivitySogCreateParams): Promise<number> => {
        const {
            call_plan_schedule_id,
            name,
            description,
            value,
            notes,
        } = params;

        // Log the parameters to verify they are correct
        console.log('Inserting SOG with parameters:', params);
        try {
			const result = await db.runAsync(
				`INSERT INTO ActivitySog (call_plan_schedule_id, name, value, description, notes)
                 VALUES (?, ?, ?, ?, ?)`,
				[call_plan_schedule_id, name, value, description, notes]
			);
			const insertId = result.lastInsertRowId as number;

            // Log the insertId to confirm successful insertion
            console.log('Activity SOG inserted with ID:', insertId);
            return insertId;

        } catch (error) {
			console.error('Error inserting Activity SOG : ', error);
			throw error;
		}
    },

    update: async (
		db: SQLite.SQLiteDatabase,
		params: ActivitySogUpdateParams
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
			`UPDATE ActivitySog SET ${fields} WHERE id = ?`,
			[...values, params.id]
		);
	},

    findByCallPlanScheduleId: async (db: SQLite.SQLiteDatabase, call_plan_schedule_id: number): Promise<ActivitySog[]> => {
		const result = await db.getAllAsync<ActivitySog>(
			`SELECT * FROM ActivitySog WHERE call_plan_schedule_id = ?`,
			[call_plan_schedule_id]
		);
		return result;
	},
}
