import * as SQLite from 'expo-sqlite';
import { ActivityBranch } from './ActivityBranchRepository';
import { ActivitySog } from './ActivitySogRepository';
import { ActivitySio } from './ActivitySioRepository';
import { ActivityProgram } from './ActivityProgramRepository';
import { ActivityOutlet } from './ActivityOutletRepository';

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
	latitude?: string;
	longitude?: string;
	survey_outlet_id?: number;
	program_id?: number;
	photo_first?: string;
	photo_second?: string;
	notes_survey?: string;
	fulfilled?:number
}

interface ActivityWithDetail {
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
	photo: any;
	is_sync: number;
	id_server: number;
	photo_program?: any;
	sale_outlet_weekly?: number;
	latitude?: string;
	longitude?: string;
	survey_outlet_id?: number;
	program_id?: number;
	photo_first?: string;
	photo_second?: string;
	notes_survey?: string;
	activity_sio?: ActivitySio[];
	activity_sog?: ActivitySog[];
	activity_branch?: ActivityBranch[];
	activity_program?: ActivityProgram[];
	range_facility?: ActivityOutlet[];
	fulfilled?:number;
}

export const dropTableExisting = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    await db.runAsync('DROP TABLE IF EXISTS Activity');
    await db.runAsync('DROP TABLE IF EXISTS ActivitySio');
    await db.runAsync('DROP TABLE IF EXISTS ActivitySog');
    await db.runAsync('DROP TABLE IF EXISTS ActivityBranch');
    await db.runAsync('DROP TABLE IF EXISTS ActivityProgram');
    await db.runAsync('DROP TABLE IF EXISTS ActivityOutlet');
    console.log('All tables dropped successfully');
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
            id_server INTEGER,
			latitude TEXT,
			longitude TEXT,
			survey_outlet_id INTEGER,
			program_id INTEGER,
			photo_first TEXT,
			photo_second TEXT,
			notes_survey TEXT,
			fulfilled INTEGER DEFAULT 0
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
			latitude,
			longitude,
			survey_outlet_id,
			program_id,
			photo_first,
			photo_second,
			notes_survey,
			fulfilled
		} = params;
		const result = await db.runAsync(
			`INSERT INTO Activity (user_id, call_plan_id, call_plan_schedule_id, outlet_id, status, area, region, brand, type_sio, start_time, end_time, photo, photo_program, sale_outlet_weekly, is_sync, id_server, latitude, longitude, survey_outlet_id, program_id, photo_first, photo_second, notes_survey, fulfilled)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
				latitude ?? '',
				longitude ?? '',
				survey_outlet_id ?? 0,
				program_id ?? 0,
				photo_first ?? '',
				photo_second ?? '',
				notes_survey ?? '',
				fulfilled ?? 0,
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

	findUnsyncedActivities: async (
		db: SQLite.SQLiteDatabase
	): Promise<Activity[]> => {
		const result = await db.getAllAsync<Activity>(`SELECT * FROM Activity WHERE is_sync = 0 AND fulfilled = 1`);
		return result;
	},

	findSyncedActivities: async (
		db: SQLite.SQLiteDatabase
	): Promise<Activity[]> => {
		const result = await db.getAllAsync<Activity>(`SELECT * FROM Activity WHERE is_sync = 1 AND fulfilled = 1`);
		return result;
	},

	findActivityWithDetail: async (
		db: SQLite.SQLiteDatabase,
		call_plan_schedule_id: number
	): Promise<ActivityWithDetail[]> => {
		const activity = await db.getAllAsync<Activity>(
			`SELECT * FROM Activity WHERE call_plan_schedule_id = ?`,
			[call_plan_schedule_id],
		);

		if (!activity.length) {
			return [];
		}

		const activityOutlets = await db.getAllAsync<ActivityOutlet>(
			`SELECT * FROM ActivityOutlet WHERE call_plan_schedule_id = ?`,
			[call_plan_schedule_id]
		);

		const activitySios = await db.getAllAsync<ActivitySio>(
			`SELECT * FROM ActivitySio WHERE call_plan_schedule_id = ?`,
			[call_plan_schedule_id]
		);

		const activitySogs = await db.getAllAsync<ActivitySog>(
			`SELECT * FROM ActivitySog WHERE call_plan_schedule_id = ?`,
			[call_plan_schedule_id]
		);

		const activityBranches = await db.getAllAsync<ActivityBranch>(
			`SELECT * FROM ActivityBranch WHERE call_plan_schedule_id = ?`,
			[call_plan_schedule_id]
		);

		const activityPrograms = await db.getAllAsync<ActivityProgram>(
			`SELECT * FROM ActivityProgram WHERE call_plan_schedule_id = ?`,
			[call_plan_schedule_id]
		);

		return activity.map((act) => ({
			...act,
			range_facility: activityOutlets,
			activity_sio: activitySios,
			activity_sog: activitySogs,
			activity_branch: activityBranches,
			activity_program: activityPrograms,
		}));
	},



	deletActivityWithDetail: async (
		db: SQLite.SQLiteDatabase
	): Promise<void> => {
		await db.runAsync(
			`DELETE FROM Activity WHERE is_sync = 1 AND fulfilled = 1`
		);
		await db.runAsync(
			`DELETE FROM ActivityOutlet WHERE is_sync = 1 AND fulfilled = 1`
		);
		await db.runAsync(
			`DELETE FROM ActivitySio WHERE is_sync = 1 AND fulfilled = 1`,
		);
		await db.runAsync(
			`DELETE FROM ActivitySog WHERE is_sync = 1 AND fulfilled = 1`,
		);
		await db.runAsync(
			`DELETE FROM ActivityBranch WHERE is_sync = 1 AND fulfilled = 1`,
		);
		await db.runAsync(
			`DELETE FROM ActivityProgram WHERE is_sync = 1 AND fulfilled = 1`,
		);

		console.log("all data is_sync = 1 and fulfilled = 1 is DELETE from table")
	},
};
