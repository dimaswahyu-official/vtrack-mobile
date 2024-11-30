import * as SQLite from 'expo-sqlite';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

let db: SQLite.SQLiteDatabase;

export const getDatabaseInstance = (): SQLite.SQLiteDatabase => {
    if (db === null) {
        db = SQLite.openDatabaseSync('VTrackOffline.db'); // Open or create the database
    }
    return db;
};

export const shareDatabaseFile = async () => {
    const dbPath = `${FileSystem.documentDirectory}SQLite/VTrackOffline.db`;
    try {
        return await Sharing.shareAsync(dbPath);
    } catch (error) {
        console.error('Error sharing database file:', error);
    }
};