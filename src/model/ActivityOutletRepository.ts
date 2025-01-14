import * as SQLite from 'expo-sqlite';

export interface ActivityOutlet {
	id?: number;
	call_plan_schedule_id: number;
	label: string;
	value: number;
	is_sync: number;
}

type ActivityOutletCreateParams = Omit<ActivityOutlet, 'id'>;

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

		console.log('Inserting Outlet with parameters:', params);
		try {
			const result = await db.runAsync(
				`INSERT INTO ActivityOutlet (call_plan_schedule_id, label, value, is_sync)
                 VALUES (?, ?, ?, ?)`,
				[call_plan_schedule_id, label, value, is_sync]
			);
			const insertId = result.lastInsertRowId as number;

			console.log('Activity Outlet inserted with ID:', insertId);
			return insertId;
		} catch (error) {
			console.error('Error inserting Activity Outlet : ', error);
			throw error;
		}
	},
};
