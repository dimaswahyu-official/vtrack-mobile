import * as SQLite from 'expo-sqlite';
import ActivityService from '../services/activityService';
import Toast from 'react-native-toast-message';
type ActivityWithDetails = {
    id: number;
    id_server: number;
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
    activity_sio_id: number; 
    activity_sog_id: number; 
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
    id_server: number;
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

// Function to add the id_server column
export const addIdServerColumn = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    try {
        await db.execAsync(`
            ALTER TABLE Activity ADD COLUMN id_server INTEGER DEFAULT 0;
        `);
        console.log('Column id_server added successfully.');
    } catch (error: unknown) {
        if (error instanceof Error && error.message.includes('duplicate column name: id_server')) {
            console.log('Column id_server already exists, skipping addition.');
        } else {
            console.error('Error adding id_server column:', error);
            throw error; // Rethrow if it's a different error
        }
    }
};

// Function to create tables
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
  
  // Call the function to add the new column if it doesn't exist
  await addIdServerColumn(db);

  Toast.show({
    text1: 'Tables created or already exist.',
    type: 'success',
  }); // Log message after table creation
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
            id_server
        } = params;

        // Log the parameters to verify they are correct
        console.log('Inserting Activity with parameters:', params);

        try {
            const result = await db.runAsync(
                `INSERT INTO Activity (
                    user_id, call_plan_id, call_plan_schedule_id, outlet_id,
                    status, area, region, brand, type_sio, start_time, end_time, photo, is_sync, id_server
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                    is_sync ? 1 : 0,
                    id_server ? id_server : 0
                ]
            );

            const insertId = result.lastInsertRowId as number;

            // Log the insertId to confirm successful insertion
            console.log('Activity inserted with ID:', insertId);

            // Proceed with creating related ActivitySio and ActivitySog if needed
            if (activity_sio) {
                for (const sio of activity_sio) {
                    // Ensure sio has the required properties
                    await ActivitySioModel.createSio(db, insertId, {
                        ...sio,
                        activity_id: insertId // Ensure activity_id is set
                    });
                }
            }
            if (activity_sog) {
                for (const sog of activity_sog) {
                    await ActivitySogModel.createSog(db, insertId, sog);
                }
            }

            return insertId;

        } catch (error) {
            console.error('Error inserting Activity:', error); // Log the error
            throw error; // Rethrow the error if needed
        }
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
            id_server: results[0].id_server,
            activity_sio: [],
            activity_sog: [],
        };

        // Populate activity_sio
        const activitySioIds = new Set();
        for (const result of results) {
            if (result.activity_sio_id && !activitySioIds.has(result.activity_sio_id)) {
                activity.activity_sio?.push({
                    activity_id: result.activity_sio_id,
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
                    activity_id: result.activity_sog_id,
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
            id_server: results[0].id_server,
            activity_sio: [],
            activity_sog: [],
        };

        // Populate activity_sio
        const activitySioIds = new Set(); // To track unique activity_sio IDs
        for (const result of results) {
            if (result.activity_sio_id && !activitySioIds.has(result.activity_sio_id)) {
                activity.activity_sio?.push({
                    activity_id: result.activity_sio_id,
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
                    activity_id: result.activity_sog_id,
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

    // Clear
    clear: async (db: SQLite.SQLiteDatabase): Promise<void> => {
        try {
            // Delete all records from the Activity table
            await db.runAsync('DELETE FROM Activity');
            console.log('All records deleted from Activity table.');

            // Delete related records from ActivitySio and ActivitySog
            await ActivitySioModel.deleteSiosByActivityId(db, 0);
            await ActivitySogModel.deleteSogsByActivityId(db, 0);
            console.log('All related records deleted from ActivitySio and ActivitySog tables.');
        } catch (error) {
            console.error('Error clearing tables:', error);
        }
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
            id_server: results[0].id_server,
            activity_sio: [],
            activity_sog: [],
        };

        // Populate activity_sio
        const activitySioIds = new Set(); // To track unique activity_sio IDs
        for (const result of results) {
            if (result.activity_sio_id && !activitySioIds.has(result.activity_sio_id)) {
                activity.activity_sio?.push({
                    activity_id: result.activity_sio_id,
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
                    activity_id: result.activity_sog_id,
                    name: result.sog_name ?? '',
                    description: result.sog_description ?? '',
                    notes: result.sog_notes ?? '',
                });
                activitySogIds.add(result.activity_sog_id); // Add to the set
            }
        }

        if (activity) {
            if (validateActivity(activity)) {
                // Simulate sync operation
                console.log('Syncing activity to server...', activity);
                const response = await ActivityService.syncActivity(activity);
                Toast.show({ type: "info", text1: "Syncing Activity", text2: "Please wait..." });
                if (response.status === 200) {
                    Toast.show({ type: "success", text1: "Syncing Activity", text2: `${response.data}` });
                    await db.runAsync('UPDATE Activity SET is_sync = 1, id_server = ? WHERE id = ?', [response.data.id, id]);
                } else {    
                    Toast.show({ type: "error", text1: "Syncing Activity", text2: `${response.data}` });
                }
            } else {
                console.log('Activity validation failed. Sync operation skipped.');
            }
        }
    },

    // Get Activity by id_server
    getActivityByIdServer: async (db: SQLite.SQLiteDatabase, isSync: number): Promise<Activity | null> => {
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
                WHERE a.is_sync = ?
        `;

        const results = await db.getAllAsync(query, [isSync]) as ActivityWithDetails[];

        if (!results.length) {
            return null; // No activity found
        }

        // Transform the results into the desired format
        const activity: Activity = {
            id_server: results[0].id_server,
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
                    activity_id: result.activity_sio_id,
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
                    activity_id: result.activity_sog_id,
                    name: result.sog_name ?? '',
                    description: result.sog_description ?? '',
                    notes: result.sog_notes ?? '',
                });
                activitySogIds.add(result.activity_sog_id); // Add to the set
            }
        }

        return activity;
    },
};

// Model untuk ActivitySio
export const ActivitySioModel = {
    // Create Detail
    createSio: async (db: SQLite.SQLiteDatabase, activityId: number, detail: ActivitySioCreateParams): Promise<number> => {
        const { name, description, notes, photo } = detail;
        console.log('activityId', activityId);
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
    console.log('activitiesToSync', activitiesToSync);
    for (const activity of activitiesToSync) {
        await ActivityModel.syncToServer(db, (activity as {id: number}).id);
    }
    Toast.show({ type: "success", text1: "Syncing Activities", text2: "Done" });
};

// Function to validate the activity object
export const validateActivity = (activity: Activity): boolean => {
    // Check required fields
    if (!activity.user_id || !activity.call_plan_schedule_id || !activity.call_plan_id || 
        !activity.outlet_id || !activity.status || !activity.area || 
        !activity.region || !activity.brand || !activity.type_sio || 
        !activity.start_time || !activity.end_time) {
        return false; // Validation failed
    }

    // Check if activity_sio has at least one entry and validate fields
    if (activity?.activity_sio?.length === 0) {
        Toast.show({ type: "error", text1: "Validation failed", text2: "activity_sio is empty." });
        return false; // Validation failed
    }

    if (!activity.activity_sio) {
        Toast.show({ type: "error", text1: "Validation failed", text2: "activity_sio is undefined." });
        return false;
    }

    for (const sio of activity.activity_sio) {
        if (!sio.name || !sio.description || !sio.notes) {
            Toast.show({ type: "error", text1: "Validation failed", text2: "activity_sio contains empty fields." });
            return false; // Validation failed
        }
    }

    // Check if activity_sog has at least one entry and validate fields
    if (activity.activity_sog?.length === 0) {
        Toast.show({ type: "error", text1: "Validation failed", text2: "activity_sog is empty." });
        return false; // Validation failed
    }

    if (!activity.activity_sog) {
        Toast.show({ type: "error", text1: "Validation failed", text2: "activity_sog is undefined." });
        return false;
    }

    for (const sog of activity.activity_sog) {
        if (!sog.name || !sog.description || !sog.notes) {
            Toast.show({ type: "error", text1: "Validation failed", text2: "activity_sog contains empty fields." });
            return false; // Validation failed
        }
    }

    return true; // Val idation passed
};

// Function to count synced activities
export const countSyncedActivities = async (db: SQLite.SQLiteDatabase): Promise<number> => {
    const result = await db.getAllAsync('SELECT COUNT(*) as count FROM Activity WHERE is_sync = 1');
    return (result as any)[0].count; // Access the count directly from the result
};

// Function to count not synced activities
export const countNotSyncedActivities = async (db: SQLite.SQLiteDatabase): Promise<number> => {
    const result = await db.getAllAsync('SELECT COUNT(*) as count FROM Activity WHERE is_sync = 0');
    return (result as any)[0].count;
};