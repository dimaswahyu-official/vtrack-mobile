import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const userProfile = sqliteTable("userProfile", {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    email: text().notNull().unique(),
    photo: text(),
});
