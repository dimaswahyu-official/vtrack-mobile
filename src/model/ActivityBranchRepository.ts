import * as SQLite from 'expo-sqlite';

export interface ActivityBranch {
	id?: number;
	call_plan_schedule_id: number;
	name: string;
	value: number;
	description: string;
	notes: string;
	is_sync: number;
}

type ActivityBranchCreateParams = Omit<ActivityBranch, 'id'>;
type ActivityBranchUpdateParams = Partial<ActivityBranch>;

export const createTableActivityBranch = async (
	db: SQLite.SQLiteDatabase
): Promise<void> => {
	await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ActivityBranch (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            call_plan_schedule_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            value INTEGER NOT NULL,
            description TEXT,
            notes TEXT,
            is_sync INTEGER DEFAULT 0,
            FOREIGN KEY (call_plan_schedule_id) REFERENCES Activity(call_plan_schedule_id)
        )
    `);
};

export const ActivityBranchModel = {
	// Insert Into
	create: async (
		db: SQLite.SQLiteDatabase,
		params: ActivityBranchCreateParams
	): Promise<number> => {
		const {
			call_plan_schedule_id,
			name,
			description,
			notes,
			value,
			is_sync,
		} = params;
		console.log('Inserting Activity Branch with parameters:', params);
		try {
			const result = await db.runAsync(
				`INSERT INTO ActivityBranch (call_plan_schedule_id, name, description, notes, value, is_sync)
                 VALUES (?, ?, ?, ?, ?, ?)`,
				[
					call_plan_schedule_id,
					name,
					description,
					notes,
					value,
					is_sync ?? 0,
				]
			);
			const insertId = result.lastInsertRowId as number;

			console.log('Activity Branch inserted with ID:', insertId);
			return insertId;
		} catch (error) {
			console.error('Error inserting Activity Branch : ', error);
			throw error;
		}
	},

	update: async (
		db: SQLite.SQLiteDatabase,
		params: ActivityBranchUpdateParams
	): Promise<void> => {
		if (!params.id) {
			throw new Error('id is required for update');
		}

		const entries = Object.entries(params).filter(([key]) => key !== 'id');

		if (entries.length === 0) {
			return;
		}

		const fields = entries.map(([key]) => `${key} = ?`).join(', ');
		const values = entries.map(([_, value]) => value);

		await db.runAsync(`UPDATE ActivityBranch SET ${fields} WHERE id = ?`, [
			...values,
			params.id,
		]);
	},

	findByCallPlanScheduleId: async (
		db: SQLite.SQLiteDatabase,
		call_plan_schedule_id: number
	): Promise<ActivityBranch[]> => {
		const result = await db.getAllAsync<ActivityBranch>(
			`SELECT * FROM ActivityBranch WHERE call_plan_schedule_id = ?`,
			[call_plan_schedule_id]
		);
		return result;
	},
};
