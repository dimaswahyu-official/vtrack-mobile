import * as SQLite from "expo-sqlite";
import Toast from "react-native-toast-message";
import {ActivitySioModel, ActivitySogModel} from "./activityModel";


type ActivityWithDetails = {
    id: number;
    id_server: number;
    user_id:string;
    code_call_plan: number;
    call_plan_id:number;
    outlet_id:number;
    survey_outlet_id:number,
    program_id:number,
    status:number;
    area: string;
    region:string;
    brand:string;
    type_sio:string;
    start_time: string;
    end_time: string;
    photo: string;
    created_at:string;
    updated_at:string;
    is_sync: number;
}

interface Activity{
    id: number;
    id_server: number;
    user_id: string;
    code_call_plan: number;
    call_plan_id:number;
    outlet_id:number;
    survey_outlet_id:number,
    program_id:number,
    status:number;
    area: string;
    region:string;
    brand:string;
    type_sio:string;
    start_time: string;
    end_time: string;
    photo: string;
    created_at:string;
    updated_at:string;
    is_sync: number;
}

type ActivityCreateParams = Omit<Activity, 'id'>;
type ActivityUpdateParams = Partial<Activity>;

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
    await db.runAsync('DROP TABLE IF EXISTS Activity');
    // await db.runAsync('DROP TABLE IF EXISTS ActivitySio');
    // await db.runAsync('DROP TABLE IF EXISTS ActivitySog');
    // console.log('All tables dropped successfully');
    await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS Activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id INTEGER,
      call_plan_id INTEGER NOT NULL,
      code_call_plan INTEGER NOT NULL,
      outlet_id INTEGER NOT NULL,
      survey_outlet_id INTEGER NOT NULL,
      program_id INTEGER NOT NULL,
      status INTEGER NOT NULL,
      area TEXT NOT NULL,
      region TEXT NOT NULL,
      brand TEXT NOT NULL,
      type_sio TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      photo TEXT, 
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,  
      is_sync INTEGER DEFAULT 0,
      id_server INTEGER
    );
`)
    Toast.show({
        text1: 'Tables created or already exist.',
        type: 'success',
    }); // Log message after table creation
}

// Model Untuk Activity
export const ActivityModel2 = {
    // Create
    create: async (db: SQLite.SQLiteDatabase, params: ActivityCreateParams): Promise<number> => {
        const {
            user_id,
            call_plan_id,
            code_call_plan,
            outlet_id,
            survey_outlet_id,
            program_id,
            status,
            area,
            region,
            brand,
            type_sio,
            start_time,
            end_time,
            photo,
            updated_at,
            created_at,
            is_sync,
            id_server
        } = params;

        // Log the parameters to verify they are correct
        console.log('Inserting Activity with parameters:', params);
        try {
            const result = await db.runAsync(
                `INSERT INTO Activity (user_id,
                                       call_plan_id,
                                       code_call_plan,
                                       outlet_id,
                                       survey_outlet_id,
                                       program_id,
                                       status,
                                       area,
                                       region,
                                       brand,
                                       type_sio,
                                       start_time,
                                       end_time,
                                       photo,
                                       updated_at,
                                       created_at,
                                       is_sync,
                                       id_server)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user_id,
                    call_plan_id,
                    code_call_plan,
                    outlet_id,
                    survey_outlet_id,
                    program_id,
                    status,
                    area,
                    region,
                    brand,
                    type_sio,
                    start_time,
                    end_time,
                    photo ? JSON.stringify(photo) : null,
                    updated_at,
                    created_at,
                    is_sync ? 1 : 0,
                    id_server ? id_server : 0
                ]
            );
            const insertId = result.lastInsertRowId as number;

            // Log the insertId to confirm successful insertion
            console.log('Activity inserted with ID:', insertId);
            return insertId;

        } catch (error) {
            console.error('Error inserting Activity:', error); // Log the error
            throw error; // Rethrow the error if needed
        }

    },
    // Get Activity All Schedule
    getActivityAllSchedule : async (db: SQLite.SQLiteDatabase): Promise<Activity[]> => {
        const query = `
            SELECT
                id,
                user_id,
                code_call_plan,
                call_plan_id,
                outlet_id,
                survey_outlet_id,
                program_id,
                status,
                area,
                region,
                brand,
                type_sio,
                start_time,
                end_time,
                photo,
                updated_at,
                created_at,
                is_sync,
            FROM Activity
            `;

        const results = await db.getAllAsync(query) as ActivityWithDetails[];

        if (!results.length) {
            return []; // No activity found
        }

        // Transform the results into the desired format
        const activity: Activity = {
            id: results[0].id,
            user_id: results[0].user_id,
            code_call_plan: results[0].code_call_plan,
            call_plan_id: results[0].call_plan_id ?? 0,
            outlet_id: results[0].outlet_id,
            survey_outlet_id: results[0].survey_outlet_id,
            program_id :results[0].program_id,
            status: results[0].status,
            area: results[0].area,
            region: results[0].region,
            brand: results[0].brand,
            type_sio: results[0].type_sio,
            photo: results[0].photo,
            id_server: results[0].id_server,
            updated_at:results[0].updated_at,
            created_at:results[0].created_at,
            start_time:results[0].start_time,
            end_time:results[0].end_time,
            is_sync:results[0].is_sync,
        };
        return [activity];
    }
}




