import * as SQLite from 'expo-sqlite';

interface Activity {
    id?: number;
    user_id: number;
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
    activity_sio?: ActivitySio[];
    activity_sog?: ActivitySog[];
}

interface ActivitySio {
    id?: number;
    activity_id: number;
    name: string;
    description: string;
    notes: string;
    photo: string;
}

interface ActivitySog {
    id?: number;
    activity_id: number;
    name: string;
    description: string;
    notes: string;
}

type ActivityCreateParams = Omit<Activity, 'id'>;
type ActivityUpdateParams = Partial<Activity>;

type ActivitySioCreateParams = Omit<ActivitySio, 'id'>;
type ActivitySioUpdateParams = Partial<ActivitySio>;
type ActivitySogCreateParams = Omit<ActivitySog, 'id'>;
type ActivitySogUpdateParams = Partial<ActivitySog>;    

// Initialize database and tables asynchronously
export const createTableActivity = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    await db.execAsync(`
    PRAGMA journal_mode = WAL;

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
      photo TEXT,   
      is_sync INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ActivitySio (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      activity_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      notes TEXT,
      photo TEXT,
      FOREIGN KEY (activity_id) REFERENCES Activity(id)
    );

    CREATE TABLE IF NOT EXISTS ActivitySog (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      activity_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      notes TEXT,
      FOREIGN KEY (activity_id) REFERENCES Activity(id)
    );
  `);
  
  console.log('Tables created or already exist.'); // Log message after table creation
};

// Model untuk Activity
export const ActivityModel = {
    // Create
    create: async (db: SQLite.SQLiteDatabase, params: ActivityCreateParams): Promise<number> => {
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
            is_sync,
            activity_sio,
            activity_sog,
        } = params;

        const result = await db.runAsync(
            `INSERT INTO Activity (
                user_id, call_plan_id, call_plan_schedule_id, outlet_id,
                status, area, region, brand, type_sio, start_time, end_time, photo, is_sync
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
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
                is_sync
            ]
        );
        const insertId = result.lastInsertRowId as number;
        if (activity_sio) {
            for (const sio of activity_sio) {   
                await ActivitySioModel.createSio(db, insertId, sio);
            }
        }
        if (activity_sog) {
            for (const sog of activity_sog) {
                await ActivitySogModel.createSog(db, insertId, sog);
            }
        }
        return insertId;
    },

    // Read All
    readAll: async (db: SQLite.SQLiteDatabase): Promise<Activity[]> => {
        const allRows = await db.getAllAsync('SELECT * FROM Activity');
        return allRows as Activity[];
    },

    // Update
    update: async (db: SQLite.SQLiteDatabase, id: number, params: ActivityUpdateParams): Promise<void> => {
        const { activity_sio, activity_sog } = params;
        const fields = Object.keys(params).map((key) => `${key} = ?`).join(', ');
        const values = Object.values(params).filter(value => typeof value === 'string' || typeof value === 'number');
        await db.runAsync(
            `UPDATE Activity SET ${fields} WHERE id = ?`,
            [...values, id]
        );
        if (activity_sio) {
            for (const sio of activity_sio) {
                await ActivitySioModel.updateSio(db, id, sio);
            }
        }
        if (activity_sog) {
            for (const sog of activity_sog) {
                await ActivitySogModel.updateSog(db, id, sog);
            }
        }
    },

    // Delete
    delete: async (db: SQLite.SQLiteDatabase, id: number): Promise<void> => {
        await db.runAsync('DELETE FROM Activity WHERE id = ?', id);
        await ActivitySioModel.deleteSio(db, id);
        await ActivitySogModel.deleteSog(db, id);
    },

    // Sync to server
    syncToServer: async (db: SQLite.SQLiteDatabase, id: number): Promise<void> => {
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

// Model untuk ActivitySio
export const ActivitySioModel = {
    // Create Detail
    createSio: async (db: SQLite.SQLiteDatabase, activityId: number, detail: ActivitySioCreateParams): Promise<number> => {
        const { name, description, notes, photo } = detail;
        const result = await db.runAsync(
            `INSERT INTO ActivitySio (activity_id, name, description, notes, photo) VALUES (?, ?, ?, ?, ?)`,
            [activityId, name, description, notes, photo]
        );
        return result.lastInsertRowId as number;
    },

    // Read All Details by Activity ID
    readAllSio: async (db: SQLite.SQLiteDatabase, activityId: number): Promise<ActivitySio[]> => {
        const details = await db.getAllAsync('SELECT * FROM ActivitySio WHERE activity_id = ?', activityId);
        return details as ActivitySio[];
    },

    // Update Detail
    updateSio: async (db: SQLite.SQLiteDatabase, id: number, params: ActivitySioUpdateParams): Promise<void> => {
        const fields = Object.keys(params).map((key) => `${key} = ?`).join(', ');
        const values = Object.values(params).filter(value => typeof value === 'string' || typeof value === 'number');
        await db.runAsync(
            `UPDATE ActivitySio SET ${fields} WHERE id = ?`,    
            [...values, id]
        );
    },

    // Delete Detail
    deleteSio: async (db: SQLite.SQLiteDatabase, detailId: number): Promise<void> => {
        await db.runAsync('DELETE FROM ActivitySio WHERE id = ?', detailId);
    },
};

// Model untuk ActivitySog
export const ActivitySogModel = { 
    // Create Detail    
    createSog: async (db: SQLite.SQLiteDatabase, activityId: number, detail: ActivitySogCreateParams): Promise<number> => {
        const { name, description, notes } = detail;
        const result = await db.runAsync(
            `INSERT INTO ActivitySog (activity_id, name, description, notes) VALUES (?, ?, ?, ?)`,
            [activityId, name, description, notes]
        );
        return result.lastInsertRowId as number;
    },

    // Read All Details by Activity ID      
    readAllSog: async (db: SQLite.SQLiteDatabase, activityId: number): Promise<ActivitySog[]> => {
        const details = await db.getAllAsync('SELECT * FROM ActivitySog WHERE activity_id = ?', activityId);
        return details as ActivitySog[];
    },

    // Update Detail
    updateSog: async (db: SQLite.SQLiteDatabase, id: number, params: ActivitySogUpdateParams): Promise<void> => {
        const fields = Object.keys(params).map((key) => `${key} = ?`).join(', ');
        const values = Object.values(params).filter(value => typeof value === 'string' || typeof value === 'number');
        await db.runAsync(
            `UPDATE ActivitySog SET ${fields} WHERE id = ?`,
            [...values, id]
        );
    },

    // Delete Detail
    deleteSog: async (db: SQLite.SQLiteDatabase, detailId: number): Promise<void> => {
        await db.runAsync('DELETE FROM ActivitySog WHERE id = ?', detailId);
    },      
};