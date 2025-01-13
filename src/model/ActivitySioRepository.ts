import * as SQLite from 'expo-sqlite';

export interface ActivitySio {
	id?: number;
	call_plan_schedule_id: number;
	name: string;
	description: string;
	notes: string;
	photo: string;
	photo_before: string;
	photo_after: string;
}

type ActivitySioCreateParams = Omit<ActivitySio, 'id'>;
type ActivitySioUpdateParams = Partial<ActivitySio>;

export const createTableActivitySio = async (
	db: SQLite.SQLiteDatabase
): Promise<void> => {
	await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ActivitySio
        (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            call_plan_schedule_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            notes TEXT,
            photo TEXT,
            photo_before TEXT,
            photo_after TEXT,
            FOREIGN KEY (call_plan_schedule_id) REFERENCES Activity (call_plan_schedule_id)
        )
    `);
};
// Model Untuk SIO
export const ActivitySioModel = {
	// Insert Into
	create: async (
		db: SQLite.SQLiteDatabase,
		params: ActivitySioCreateParams
	): Promise<number> => {
		const {
			call_plan_schedule_id,
			name,
			description,
			notes,
			photo,
			photo_before,
			photo_after,
		} = params;

		// Log the parameters to verify they are correct
		console.log('Inserting SIO with parameters:', params);
		try {
			const result = await db.runAsync(
				`INSERT INTO ActivitySio (call_plan_schedule_id, name, description, notes, photo, photo_before, photo_after)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
				[
					call_plan_schedule_id,
					name,
					description,
					notes,
					photo,
					photo_before,
					photo_after,
				]
			);
			const insertId = result.lastInsertRowId as number;

			// Log the insertId to confirm successful insertion
			console.log('Activity SIO inserted with ID:', insertId);
			return insertId;
		} catch (error) {
			console.error('Error inserting Activity SIO : ', error);
			throw error;
		}
	},

	update: async (
		db: SQLite.SQLiteDatabase,
		params: ActivitySioUpdateParams
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
			`UPDATE ActivitySio SET ${fields} WHERE id = ?`,
			[...values, params.id]
		);
	},

	findByCallPlanScheduleId: async (
		db: SQLite.SQLiteDatabase,
		call_plan_schedule_id: number
	): Promise<ActivitySio[]> => {
		const result = await db.getAllAsync<ActivitySio>(
			`SELECT * FROM ActivitySio WHERE call_plan_schedule_id = ?`,
			[call_plan_schedule_id]
		);
		return result;
	},

	findById: async (
		db: SQLite.SQLiteDatabase,
		id: number
	): Promise<ActivitySio[]> => {
		const result = await db.getAllAsync<ActivitySio>(`SELECT * FROM ActivitySio WHERE id = ?`, [id]);
		return result;
	},
};
