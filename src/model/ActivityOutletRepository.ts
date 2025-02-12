import * as SQLite from 'expo-sqlite';

export interface ActivityOutlet {
	id?: number;
	call_plan_schedule_id: number;
	label: string;
	value: number;
	is_sync: number;
}

type ActivityOutletCreateParams = Omit<ActivityOutlet, 'id'>;
type ActivityOutletUpdateParams = Partial<ActivityOutlet>;

export const createTableActivityOutlet = async (
	db: SQLite.SQLiteDatabase
): Promise<void> => {
	await db.execAsync(`
		CREATE TABLE IF NOT EXISTS ActivityOutlet (
													  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
													  call_plan_schedule_id INTEGER NOT NULL,
													  label TEXT NOT NULL,
													  value INTEGER NOT NULL,
													  is_sync INTEGER DEFAULT 0,
													  FOREIGN KEY (call_plan_schedule_id) REFERENCES Activity(call_plan_schedule_id)
			)
	`);
};

export const ActivityOutletModel = {
	create: async (
		db: SQLite.SQLiteDatabase,
		params: ActivityOutletCreateParams
	): Promise<number> => {
		const { call_plan_schedule_id, label, value, is_sync } = params;
		try {
			const result = await db.runAsync(
				`INSERT INTO ActivityOutlet (call_plan_schedule_id, label, value, is_sync)
				 VALUES (?, ?, ?, ?)`,
				[call_plan_schedule_id, label, value, is_sync ?? 0]
			);
			const insertId = result.lastInsertRowId as number;
			return insertId;
		} catch (error) {
			console.error('Error inserting Activity Outlet : ', error);
			throw error;
		}
	},

	update: async (
		db: SQLite.SQLiteDatabase,
		params: ActivityOutletUpdateParams
	): Promise<void> => {
		if (!params.id) {
			throw new Error('id is required for update');
		}

		const entries = Object.entries(params).filter(
			([key]) => key !== 'call_plan_schedule_id'
		);

		if (entries.length === 0) {
			return;
		}

		const fields = entries.map(([key]) => `${key} = ?`).join(', ');
		const values = entries.map(([_, value]) => value);

		await db.runAsync(
			`UPDATE ActivityOutlet SET ${fields} WHERE id = ?`,
			[...values, params.id]
		);
	},

	findByCallPlanScheduleId: async (
		db: SQLite.SQLiteDatabase,
		call_plan_schedule_id: number
	): Promise<ActivityOutlet[]> => {
		const result = await db.getAllAsync<ActivityOutlet>(
			`SELECT * FROM ActivityOutlet WHERE call_plan_schedule_id = ?`,
			[call_plan_schedule_id]
		);
		return result;
	},
};
