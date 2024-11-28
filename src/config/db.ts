import * as SQLite from 'expo-sqlite';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
let db: SQLite.SQLiteDatabase;

const openDatabase = async () => {
    try {
        db = await SQLite.openDatabaseAsync('VTrackOffline'); // Open the database
        console.log('Database opened successfully!');
    } catch (error) {
        console.error('Error opening database:', error);
    }
};

export { db, openDatabase };

export const shareDatabaseFile = async () => {
    const dbPath = `${FileSystem.documentDirectory}SQLite/VTrackOffline.db`;
    try {
        return await Sharing.shareAsync(dbPath);
    } catch (error) {
        console.error('Error sharing database file:', error);
    }
};