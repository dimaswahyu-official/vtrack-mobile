import * as SQLite from 'expo-sqlite';
import { ActivityBranch } from './ActivityBranchRepository';
import { ActivitySog } from './ActivitySogRepository';
import { ActivitySio } from './ActivitySioRepository';
import { ActivityProgram } from './ActivityProgramRepository';

interface Activity {
	id?: number;
	user_id: string;
	call_plan_id: number;
	call_plan_schedule_id: number;
	outlet_id: number;
	status: number;
	area: string;
	region: string;
	brand: string;
	type_sio: string;
	start_time: string;
	end_time: string;
	photo: string;
	is_sync: number;
	id_server: number;
	photo_program?: string;
	sale_outlet_weekly?: number;
}

interface ActivityDetail {
	id?: number;
	user_id: string;
	call_plan_id: number;
	call_plan_schedule_id: number;
	outlet_id: number;
	status: number;
	area: string;
	region: string;
	brand: string;
	type_sio: string;
	start_time: string;
	end_time: string;
	photo: string;
	is_sync: number;
	id_server: number;
	photo_program?: string;
	sale_outlet_weekly?: number;
	activity_sio?: ActivitySio[];
	activity_sog?: ActivitySog[];
	activity_branch?: ActivityBranch[];
	activity_program?: ActivityProgram[];
}

type ActivityCreateParams = Omit<Activity, 'id'>;
type ActivityUpdateParams = Partial<Activity>;

export const createTableActivity = async (
	db: SQLite.SQLiteDatabase
): Promise<void> => {
	await db.execAsync(`
        CREATE TABLE IF NOT EXISTS Activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            user_id INTEGER,
            call_plan_id INTEGER NOT NULL,
            call_plan_schedule_id INTEGER NOT NULL,
            outlet_id INTEGER NOT NULL,
            status INTEGER NOT NULL,
            area TEXT NOT NULL,
            region TEXT NOT NULL,
            brand TEXT NOT NULL,
            type_sio TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            photo TEXT NOT NULL,
			photo_program TEXT,
			sale_outlet_weekly INTEGER DEFAULT 0,
            is_sync INTEGER DEFAULT 0,
            id_server INTEGER
        )
    `);
};

export const ActivityRepository = {
	create: async (
		db: SQLite.SQLiteDatabase,
		params: ActivityCreateParams
	): Promise<number> => {
		const {
			user_id,
			call_plan_id,
			call_plan_schedule_id,
			outlet_id,
			status,
			area,
			region,
			brand,
			type_sio,
			start_time,
			end_time,
			photo,
			photo_program,
			sale_outlet_weekly,
			is_sync,
			id_server,
		} = params;
		const result = await db.runAsync(
			`INSERT INTO Activity (user_id, call_plan_id, call_plan_schedule_id, outlet_id, status, area, region, brand, type_sio, start_time, end_time, photo, photo_program, sale_outlet_weekly, is_sync, id_server)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				user_id ?? 0,
				call_plan_id ?? 0,
				call_plan_schedule_id ?? 0,
				outlet_id ?? 0,
				status ?? 0,
				area ?? '',
				region ?? '',
				brand ?? '',
				type_sio ?? '',
				start_time ?? '',
				end_time ?? '',
				photo ?? '',
				photo_program ?? '',
				sale_outlet_weekly ?? 0,
				is_sync ?? 0,
				id_server ?? 0,
			]
		);
		return result.lastInsertRowId;
	},

	update: async (
		db: SQLite.SQLiteDatabase,
		params: ActivityUpdateParams
	): Promise<void> => {
		if (!params.call_plan_schedule_id) {
			throw new Error('call_plan_schedule_id is required for update');
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
			`UPDATE Activity SET ${fields} WHERE call_plan_schedule_id = ?`,
			[...values, params.call_plan_schedule_id]
		);
	},

	findByCallPlanScheduleId: async (
		db: SQLite.SQLiteDatabase,
		call_plan_schedule_id: number
	): Promise<Activity[]> => {
		const result = await db.getAllAsync<Activity>(
			`SELECT * FROM Activity WHERE Activity.call_plan_schedule_id = ?`,
			[call_plan_schedule_id]
		);
		return result;
	},

	getAll: async (db: SQLite.SQLiteDatabase): Promise<Activity[]> => {
		const result = await db.getAllAsync<Activity>(`SELECT * FROM Activity`);
		return result;
	},
};
