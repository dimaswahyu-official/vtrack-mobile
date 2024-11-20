import * as SQLite from 'expo-sqlite';

// Wrapping the database initialization in an async function
const initDatabase = async () => {
    const db = await SQLite.openDatabaseAsync('VTrackOffline');
    return db;
};

interface Activity {
    id?: number;
    user_id: number;
    call_plan_id: number;
    call_plan_schedule_id: number;
    outlet_id: number;
    code_outlet: string;
    code_call_plan: string;
    status: string;
    area: string;
    region: string;
    brand: string;
    type_sio: string;
    brand_type_sio: string;
    amo_brand_type: string;
    start_time: string;
    end_time: string;
    is_sync: number;
}

interface ActivityDetail {
    id?: number;
    activity_id: number;
    type: string;
    name: string;
    value: string;
    description: string;
    notes: string;
    photo: string;
    is_sync: number;
}

type ActivityCreateParams = Omit<Activity, 'id'>;
type ActivityUpdateParams = Partial<Activity>;

type ActivityDetailCreateParams = Omit<ActivityDetail, 'id'>;
type ActivityDetailUpdateParams = Partial<ActivityDetail>;

// Initialize database and tables asynchronously
export const createTableActivity = async (): Promise<void> => {
    const db = await initDatabase();
    await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS Activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id INTEGER,
      call_plan_id INTEGER NOT NULL,
      call_plan_schedule_id INTEGER NOT NULL,
      outlet_id INTEGER NOT NULL,
      code_outlet TEXT NOT NULL,
      code_call_plan TEXT NOT NULL,
      status TEXT NOT NULL,
      area TEXT NOT NULL,
      region TEXT NOT NULL,
      brand TEXT NOT NULL,
      type_sio TEXT NOT NULL,
      brand_type_sio TEXT NOT NULL,
      amo_brand_type TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_sync INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ActivityDetail (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      activity_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      value TEXT,
      description TEXT,
      notes TEXT,
      photo TEXT,
      is_sync INTEGER DEFAULT 0,
      FOREIGN KEY (activity_id) REFERENCES Activity(id)
    );
  `);
};

// Rest of your code remains the same...


// Model untuk Activity
export const ActivityModel = {
    // Create
    create: async (params: ActivityCreateParams): Promise<number> => {
        const {
            user_id,
            call_plan_id,
            call_plan_schedule_id,
            outlet_id,
            code_outlet,
            code_call_plan,
            status,
            area,
            region,
            brand,
            type_sio,
            brand_type_sio,
            amo_brand_type,
            start_time,
            end_time,
            is_sync,
        } = params;
        const db = await initDatabase();
        const result = await db.runAsync(
            `INSERT INTO Activity (
        user_id, call_plan_id, call_plan_schedule_id, outlet_id,
        code_outlet, code_call_plan, status, area, region, brand,
        type_sio, brand_type_sio, amo_brand_type, start_time, end_time, is_sync
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [
                user_id,
                call_plan_id,
                call_plan_schedule_id,
                outlet_id,
                code_outlet,
                code_call_plan,
                status,
                area,
                region,
                brand,
                type_sio,
                brand_type_sio,
                amo_brand_type,
                start_time,
                end_time,
                is_sync
            ]
        );
        return result.lastInsertRowId as number;
    },

    // Read All
    readAll: async (): Promise<Activity[]> => {
        const db = await initDatabase();
        const allRows = await db.getAllAsync('SELECT * FROM Activity');
        return allRows as Activity[];
    },

    // Update
    update: async (id: number, params: ActivityUpdateParams): Promise<void> => {
        const fields = Object.keys(params).map((key) => `${key} = ?`).join(', ');
        const values = Object.values(params);
        const db = await initDatabase();
        await db.runAsync(
            `UPDATE Activity SET ${fields} WHERE id = ?`,
            [...values, id]
        );
    },

    // Delete
    delete: async (id: number): Promise<void> => {
        const db = await initDatabase();
        await db.runAsync('DELETE FROM Activity WHERE id = ?', id);
    },

    // Sync to server (dummy example)
    syncToServer: async (id: number): Promise<void> => {
        const db = await initDatabase();
        const activity = await db.getFirstAsync(
            'SELECT * FROM Activity WHERE id = ?',
            id
        );
        if (activity) {
            // Simulate sync operation
            console.log('Syncing activity to server...', activity);
            // Example: send the data to your server here
            // await fetch('your-server-endpoint', { method: 'POST', body: JSON.stringify(activity) });
        }
    },
};

// Model untuk ActivityDetail
export const ActivityDetailModel = {
    // Create Detail
    createDetail: async (activityId: number, detail: ActivityDetailCreateParams): Promise<number> => {
        const { type, name, value, description, notes, photo } = detail;
        const db = await initDatabase();
        const result = await db.runAsync(
            `INSERT INTO ActivityDetail (activity_id, type, name, value, description, notes, photo) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [activityId, type, name, value, description, notes, photo]
        );
        return result.lastInsertRowId as number;
    },

    // Read All Details by Activity ID
    readAllDetails: async (activityId: number): Promise<ActivityDetail[]> => {
        const db = await initDatabase();
        const details = await db.getAllAsync('SELECT * FROM ActivityDetail WHERE activity_md_id = ?', activityId);
        return details as ActivityDetail[];
    },

    // Update Detail
    updateDetail: async (id: number, params: ActivityDetailUpdateParams): Promise<void> => {
        const fields = Object.keys(params).map((key) => `${key} = ?`).join(', ');
        const values = Object.values(params);
        const db = await initDatabase();
        await db.runAsync(
            `UPDATE ActivityDetail SET ${fields} WHERE id = ?`,
            [...values, id]
        );
    },

    // Delete Detail
    deleteDetail: async (detailId: number): Promise<void> => {
        const db = await initDatabase();
        await db.runAsync('DELETE FROM ActivityDetail WHERE id = ?', detailId);
    },
};
