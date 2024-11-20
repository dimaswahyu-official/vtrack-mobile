import { userProfile } from '../schema';
import { openDatabase } from "../config/db";
import { eq } from "drizzle-orm";

let dbInstance: any = null;  // Use `any` type for simplicity

// Initialize the database connection
await openDatabase().then((db) => {
    dbInstance = db;  // Store the db instance after it's open
});

// Add profile function
export const addProfile = async (name: string, email: string) => {
    if (dbInstance) {
        await dbInstance.insert(userProfile).values({name, email}).run();
    } else {
        console.error("Database not initialized");
    }
};

// Get all profiles function
export const getAllProfiles = async () => {
    if (dbInstance) {
        return await dbInstance.select().from(userProfile).all();
    } else {
        console.error("Database not initialized");
        return [];
    }
};

// Update profile function
export const updateProfile = async (id: number, name: string, email: string) => {
    if (dbInstance) {
        await dbInstance
            .update(userProfile)
            .set({name, email})
            .where(eq(userProfile.id ,id))
            .run();
    } else {
        console.error("Database not initialized");
    }
};

// Delete profile function
export const deleteProfile = async (id: number) => {
    if (dbInstance) {
        await dbInstance.delete(userProfile).where(eq(userProfile.id , id)).run();
    } else {
        console.error("Database not initialized");
    }
};
