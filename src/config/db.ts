import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

const openDatabase = async () => {
    try {
        db = await SQLite.openDatabaseAsync('VTrackOffline'); // Open the database
        console.log('Database opened successfully!');
    } catch (error) {
        console.error('Error opening database:', error);
    }
};

