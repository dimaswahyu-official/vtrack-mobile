import * as SQLite from 'expo-sqlite';
type ActivityWithDetails = {
    id: number;
    user_id: number; 
    call_plan_schedule_id: number; 
    call_plan_id: number; 
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
    activity_sio_id?: number; 
    activity_sog_id?: number; 
    sio_name?: string; 
    sio_description?: string; 
    sio_notes?: string; 
    sio_photo?: string; 
    sog_name?: string; 
    sog_description?: string; 
    sog_notes?: string; 
};
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
    activity_id?: number;
    name: string;
    description: string;
    notes: string;
    photo: string;
}

interface ActivitySog {
    id?: number;
    activity_id?: number;
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
                photo ? JSON.stringify(photo) : null,
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

    // Update
    update: async (db: SQLite.SQLiteDatabase, id: number, params: ActivityUpdateParams): Promise<void> => {
        const { activity_sio, activity_sog, photo } = params;

        // Prepare fields for the update
        const fields = Object.keys(params)
            .filter(key => key !== 'activity_sio' && key !== 'activity_sog')
            .map((key) => {
                // Serialize the photo array to JSON if it exists
                if (key === 'photo' && Array.isArray(params[key])) {
                    return `${key} = ?`;
                }
                return `${key} = ?`;
            })
            .join(', ');

        // Prepare values for the update
        const values = Object.values(params).map(value => {
            // Serialize the photo array to JSON if it exists
            if (Array.isArray(value)) {
                return JSON.stringify(value);
            }
            return value;
        }).filter(value => typeof value === 'string' || typeof value === 'number');

        await db.runAsync(
            `UPDATE Activity SET ${fields} WHERE id = ?`,
            [...values, id]
        );

        // Delete existing related records
        if (activity_sio) {
            await ActivitySioModel.deleteSiosByActivityId(db, id);
            for (const sio of activity_sio) {
                await ActivitySioModel.createSio(db, id, sio);
            }
        }

        if (activity_sog) {
            await ActivitySogModel.deleteSogsByActivityId(db, id);
            for (const sog of activity_sog) {
                await ActivitySogModel.createSog(db, id, sog);
            }
        }
    },

    // Read All
    getAllActivity: async (db: SQLite.SQLiteDatabase): Promise<Activity[]> => {
        const query = `
            SELECT 
                a.id,
                a.user_id,
                a.call_plan_schedule_id,
                a.call_plan_id,
                a.outlet_id,
                a.status,
                a.area,
                a.region,
                a.brand,
                a.type_sio,
                a.start_time,
                a.end_time,
                a.is_sync,
                s.id AS activity_sio_id,
                s.name AS sio_name,
                s.description AS sio_description,
                s.notes AS sio_notes,
                s.photo AS sio_photo,
                g.id AS activity_sog_id,
                g.name AS sog_name,
                g.description AS sog_description,
                g.notes AS sog_notes
            FROM Activity a
            LEFT JOIN ActivitySio s ON a.id = s.activity_id
            LEFT JOIN ActivitySog g ON a.id = g.activity_id
        `;

        const results = await db.getAllAsync(query) as ActivityWithDetails[];

        if (!results.length) {
            return [];
        }

        // Transform the results into the desired format
        const activity: Activity = {
            id: results[0].id,
            user_id: results[0].user_id,
            call_plan_schedule_id: results[0].call_plan_schedule_id,
            call_plan_id: results[0].call_plan_id,
            outlet_id: results[0].outlet_id,
            status: results[0].status,
            area: results[0].area,
            region: results[0].region,
            brand: results[0].brand,
            type_sio: results[0].type_sio,
            start_time: results[0].start_time,
            end_time: results[0].end_time,
            photo: JSON.parse(results[0].photo || '[]'), // Deserialize the JSON string to an array
            is_sync: results[0].is_sync,
            activity_sio: [],
            activity_sog: [],
        };

        // Populate activity_sio
        const activitySioIds = new Set();
        for (const result of results) {
            if (result.activity_sio_id && !activitySioIds.has(result.activity_sio_id)) {
                activity.activity_sio?.push({
                    name: result.sio_name ?? '',
                    description: result.sio_description ?? '',
                    notes: result.sio_notes ?? '',
                    photo: result.sio_photo ?? '',
                });
                activitySioIds.add(result.activity_sio_id);
            }
        }

        // Populate activity_sog
        const activitySogIds = new Set();
        for (const result of results) {
            if (result.activity_sog_id && !activitySogIds.has(result.activity_sog_id)) {
                activity.activity_sog?.push({
                    name: result.sog_name ?? '',
                    description: result.sog_description ?? '',
                    notes: result.sog_notes ?? '',
                });
                activitySogIds.add(result.activity_sog_id);
            }
        }

        return [activity];
    },

    // Get Activity by call_plan_schedule_id with joins
    getActivityByScheduleId : async (db: SQLite.SQLiteDatabase, call_plan_schedule_id: number): Promise<Activity | null> => {
        const query = `
            SELECT
                a.id,
                a.user_id,
                a.call_plan_schedule_id,
                a.call_plan_id,
                a.outlet_id,
                a.status,
                a.area,
                a.region,
                a.brand,
                a.type_sio,
                a.start_time,
                a.end_time,
                a.photo,
                a.is_sync,
                s.id AS activity_sio_id,
                s.name AS sio_name,
                s.description AS sio_description,
                s.notes AS sio_notes,
                s.photo AS sio_photo,
                g.id AS activity_sog_id,
                g.name AS sog_name,
                g.description AS sog_description,
                g.notes AS sog_notes
            FROM Activity a
            LEFT JOIN ActivitySio s ON a.id = s.activity_id
            LEFT JOIN ActivitySog g ON a.id = g.activity_id
            WHERE a.call_plan_schedule_id = ?
        `;

        const results = await db.getAllAsync(query, [call_plan_schedule_id]) as ActivityWithDetails[];

        if (!results.length) {
            return null; // No activity found
        }

        // Transform the results into the desired format
        const activity: Activity = {
            id: results[0].id,
            user_id: results[0].user_id,
            call_plan_schedule_id: results[0].call_plan_schedule_id,
            call_plan_id: results[0].call_plan_id,
            outlet_id: results[0].outlet_id,
            status: results[0].status,
            area: results[0].area,
            region: results[0].region,
            brand: results[0].brand,
            type_sio: results[0].type_sio,
            start_time: results[0].start_time,
            end_time: results[0].end_time,
            photo: results[0].photo,
            is_sync: results[0].is_sync,
            activity_sio: [],
            activity_sog: [],
        };

        // Populate activity_sio
        const activitySioIds = new Set(); // To track unique activity_sio IDs
        for (const result of results) {
            if (result.activity_sio_id && !activitySioIds.has(result.activity_sio_id)) {
                activity.activity_sio?.push({
                    name: result.sio_name ?? '',
                    description: result.sio_description ?? '',
                    notes: result.sio_notes ?? '',
                    photo: result.sio_photo ?? '',
                });
                activitySioIds.add(result.activity_sio_id); // Add to the set
            }
        }

        // Populate activity_sog
        const activitySogIds = new Set(); // To track unique activity_sog IDs
        for (const result of results) {
            if (result.activity_sog_id && !activitySogIds.has(result.activity_sog_id)) {
                activity.activity_sog?.push({
                    name: result.sog_name ?? '',
                    description: result.sog_description ?? '',
                    notes: result.sog_notes ?? '',
                });
                activitySogIds.add(result.activity_sog_id); // Add to the set
            }
        }

        return activity;
    },


    // Delete
    delete: async (db: SQLite.SQLiteDatabase, id: number): Promise<void> => {
        await db.runAsync('DELETE FROM Activity WHERE id = ?', id);
        await ActivitySioModel.deleteSio(db, id);
        await ActivitySogModel.deleteSog(db, id);
    },

    // Sync to server
    syncToServer: async (db: SQLite.SQLiteDatabase, id: number): Promise<void> => {
        const query = `
            SELECT
                a.id,
                a.user_id,
                a.call_plan_schedule_id,
                a.call_plan_id,
                a.outlet_id,
                a.status,
                a.area,
                a.region,
                a.brand,
                a.type_sio,
                a.start_time,
                a.end_time,
                a.is_sync,
                s.id AS activity_sio_id,
                s.name AS sio_name,
                s.description AS sio_description,
                s.notes AS sio_notes,
                s.photo AS sio_photo,
                g.id AS activity_sog_id,
                g.name AS sog_name,
                g.description AS sog_description,
                g.notes AS sog_notes
            FROM Activity a
            LEFT JOIN ActivitySio s ON a.id = s.activity_id
            LEFT JOIN ActivitySog g ON a.id = g.activity_id
            WHERE a.id = ?
        `;

        const results = await db.getAllAsync(query, [id]) as ActivityWithDetails[];

        if (!results.length) {
            return; // No activity found
        }

        // Transform the results into the desired format
        const activity: Activity = {
            user_id: results[0].user_id,
            call_plan_schedule_id: results[0].call_plan_schedule_id,
            call_plan_id: results[0].call_plan_id,
            outlet_id: results[0].outlet_id,
            status: results[0].status,
            area: results[0].area,
            region: results[0].region,
            brand: results[0].brand,
            type_sio: results[0].type_sio,
            start_time: results[0].start_time,
            end_time: results[0].end_time,
            photo: JSON.parse(results[0].photo || '[]'), // Deserialize the JSON string to an array
            is_sync: results[0].is_sync,
            activity_sio: [],
            activity_sog: [],
        };

        // Populate activity_sio
        const activitySioIds = new Set(); // To track unique activity_sio IDs
        for (const result of results) {
            if (result.activity_sio_id && !activitySioIds.has(result.activity_sio_id)) {
                activity.activity_sio?.push({
                    name: result.sio_name ?? '',
                    description: result.sio_description ?? '',
                    notes: result.sio_notes ?? '',
                    photo: result.sio_photo ?? '',
                });
                activitySioIds.add(result.activity_sio_id); // Add to the set
            }
        }

        // Populate activity_sog
        const activitySogIds = new Set(); // To track unique activity_sog IDs
        for (const result of results) {
            if (result.activity_sog_id && !activitySogIds.has(result.activity_sog_id)) {
                activity.activity_sog?.push({
                    name: result.sog_name ?? '',
                    description: result.sog_description ?? '',
                    notes: result.sog_notes ?? '',
                });
                activitySogIds.add(result.activity_sog_id); // Add to the set
            }
        }

        if (activity) {
            // Simulate sync operation
            console.log('Syncing activity to server...', activity);
            // Example: send the data to your server here
            // await fetch('your-server-endpoint', { method: 'POST', body: JSON.stringify(activity) });

            // Update the is_sync flag to 1 after successful sync
            await db.runAsync('UPDATE Activity SET is_sync = 1 WHERE id = ?', id);
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

    // Delete Details by Activity ID
    deleteSiosByActivityId: async (db: SQLite.SQLiteDatabase, activityId: number): Promise<void> => {
        await db.runAsync('DELETE FROM ActivitySio WHERE activity_id = ?', activityId);
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

    // Delete Details by Activity ID
    deleteSogsByActivityId: async (db: SQLite.SQLiteDatabase, activityId: number): Promise<void> => {
        await db.runAsync('DELETE FROM ActivitySog WHERE activity_id = ?', activityId);
    },
};

// New function to sync activities in batches
export const syncActivitiesInBatches = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    const activitiesToSync = await db.getAllAsync('SELECT id FROM Activity WHERE is_sync = 0 LIMIT 200');
    for (const activity of activitiesToSync) {
        await ActivityModel.syncToServer(db, (activity as {id: number}).id);
    }
};