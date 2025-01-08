import * as SQLite from 'expo-sqlite';

type ActivityProgram = {
    id: number;
    activity_id: number;
    nameProgram: string;
    description: string;
    photo: string;
    activity_competitor : [ActivityCompetitor];
}

type ActivityCompetitor = {
    nameProgramCompetitor: string;
    photoCompetitor: string;
    descriptionCompetitor: string;
}

type SioCreateParams = Omit<ActivityProgram, 'id'>;

export const createTableActivityProgram = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    // await db.runAsync('DROP TABLE IF EXISTS ActivitySio');
    await db.execAsync(`
    PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS ActivityProgram(
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        activity_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT, 
        notes TEXT,
        photo TEXT, 
        photo_before TEXT,
        photo_after TEXT,
        FOREIGN KEY ( activity_id ) REFERENCES Activity (id)
        )
    `);
};