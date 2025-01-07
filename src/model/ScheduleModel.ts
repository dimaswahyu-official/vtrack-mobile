import Toast from "react-native-toast-message";
import * as SQLite from "expo-sqlite";

interface CallPlanOutlet {
    id: number;
    outlet_code: string;
    name: string;
    brand: string;
    unique_name?: string ;
    address_line: string;
    sub_district: string;
    district?: string ;
    city_or_regency?: string ;
    postal_code: number;
    latitude: string;
    longitude: string;
    sio_type: string;
    region: string;
    area: string;
    cycle: string;
    is_active: number;
    visit_day: string;
    odd_even: string;
    photos: string[];
    remarks: string;
    range_health_facilities: number;
    range_work_place: number;
    range_public_transportation_facilities: number;
    range_worship_facilities: number;
    range_playground_facilities: number;
    range_educational_facilities: number;
    survey_outlet_id?: number ;
    created_by: string;
    created_at: string;
    updated_by?: string ;
    updated_at?: string ;
    deleted_by?: string;
    deleted_at?: string ;
}

interface CallPlanSurvey {
    id: number;
    batch_code: string;
    outlet_code: string;
    name: string;
    brand: string;
    address_line: string;
    sub_district: string;
    district?: string;
    city_or_regency?: string;
    postal_code: number;
    latitude?: string ;
    longitude?: string ;
    sio_type: string;
    region: string;
    area: string;
    cycle: string;
    visit_day: string;
    odd_even: string;
    photos: string[];
    remarks: string;
    range_health_facilities: number;
    range_work_place: number;
    range_public_transportation_facilities: number;
    range_worship_facilities: number;
    range_playground_facilities: number;
    range_educational_facilities: number;
    outlet_id?: number ;
    new_outlet_id?: number ;
    status?: number ;
    is_approved?: boolean ;
    created_by: string;
    created_at: string;
    updated_by?: string ;
    updated_at?: string ;
    deleted_by?: string ;
    deleted_at?: string ;

}

interface ScheduleActivity {
    id: number;
    user_id: number;
    code_call_plan: string;
    call_plan_id: number;
    outlet_id?: number;
    survey_outlet_id?: number;
    day_plan: string;
    notes: string;
    status: number;
    type: number;
    time_start?: string ;
    time_end?: string ;
    created_by: string;
    created_at: string;
    updated_by?: string ;
    updated_at?: string ;
    deleted_by?: string ;
    deleted_at?: string ;
    program_id?: number ;
    callPlanOutlet?: CallPlanOutlet | null;
    callPlanSurvey?: CallPlanSurvey | null;
    callPlanProgram?: any | null;  // Adjust if the structure is known
    is_sync: number;
    id_server: number;

}

type ScheduleCreateParams = Omit<ScheduleActivity, 'id'>;
type ScheduleUpdateParams = Partial<ScheduleActivity>;
// Function to create tables
export const createTableSchedule = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    await db.runAsync('DROP TABLE IF EXISTS ScheduleActivity');
    await db.execAsync(`
    PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS ScheduleActivity (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id INTEGER,
        code_call_plan TEXT,
        call_plan_id INTEGER,
        outlet_id INTEGER,
        survey_outlet_id INTEGER,
        day_plan TEXT,
        notes TEXT,
        status INTEGER,
        type INTEGER,
        time_start TEXT,
        time_end TEXT,
        created_by TEXT,
        created_at TEXT,
        updated_by TEXT,
        updated_at TEXT,
        deleted_by TEXT,
        deleted_at TEXT,
        program_id INTEGER,
        callPlanOutlet TEXT,
        callPlanSurvey TEXT,
        callPlanProgram TEXT,
        is_sync INTEGER DEFAULT 0,
        id_server INTEGER
      );
`)
    Toast.show({
        text1: 'Tables created or already exist.',
        type: 'success',
    }); // Log message after table creation
}


// Model Untuk Schedule
export const ScheduleModel = {
    // Create
    create: async (db: SQLite.SQLiteDatabase, params: ScheduleCreateParams): Promise<number> => {
        const {
            user_id,
            code_call_plan,
            call_plan_id,
            outlet_id,
            survey_outlet_id,
            day_plan,
            notes,
            status,
            type,
            time_start,
            time_end,
            created_by,
            created_at,
            updated_by,
            updated_at,
            deleted_by,
            deleted_at,
            program_id,
            callPlanOutlet,
            callPlanSurvey,
            callPlanProgram,
            id_server,
            is_sync
        } = params;

        // Log the parameters to verify they are correct
        console.log('Inserting Activity with parameters:', params);
        try {
            const result = await db.runAsync(
                `INSERT INTO ScheduleActivity (
                    user_id, code_call_plan, call_plan_id, outlet_id, survey_outlet_id,
                    day_plan, notes, status, type, time_start, time_end, created_by,
                    created_at, updated_by, updated_at, deleted_by, deleted_at,
                    program_id, callPlanOutlet, callPlanSurvey, callPlanProgram,
                    id_server, is_sync
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user_id ?? null,
                    code_call_plan ?? null,
                    call_plan_id ?? null,
                    outlet_id ?? null,
                    survey_outlet_id ?? null,
                    day_plan ?? null,
                    notes ?? null,
                    status ?? null,
                    type ?? null,
                    time_start ?? null,
                    time_end ?? null,
                    created_by ?? null,
                    created_at ?? null,
                    updated_by ?? null,
                    updated_at ?? null,
                    deleted_by ?? null,
                    deleted_at ?? null,
                    program_id ?? null,
                    JSON.stringify(callPlanOutlet) ?? null,
                    JSON.stringify(callPlanSurvey) ?? null,
                    JSON.stringify(callPlanProgram) ?? null,
                    is_sync ? is_sync : 0,
                    id_server ? id_server : 0
                ],
            );
            const insertId = result.lastInsertRowId as number;

            // Log the insertId to confirm successful insertion
            console.log('Schedule inserted with ID:', insertId);
            return insertId;

        } catch (error) {
            console.error('Error inserting Activity:', error); // Log the error
            throw error; // Rethrow the error if needed
        }
    },
}