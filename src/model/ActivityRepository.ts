import * as SQLite from 'expo-sqlite';
import { ActivityBranch } from './ActivityBranchRepository';
import { ActivitySog } from './ActivitySogRepository';
import { ActivitySio } from './ActivitySioRepository';

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
}

interface ActivityDetail {
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
    activity_branch?: ActivityBranch[];
}

export const createTableActivity = async (db: SQLite.SQLiteDatabase): Promise<void> => {
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
            is_sync INTEGER DEFAULT 0,
            id_server INTEGER
        )
    `);
};