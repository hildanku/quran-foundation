import { sql } from "drizzle-orm"
import { char, integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core"

export const roleEnum = pgEnum('role', [
    'admin',
    'member',
])

export const userTable = pgTable('users', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    created_at: integer('created_at')
        .notNull()
        .default(sql`extract(epoch from now())`),
    updated_at: integer('updated_at')
        .notNull()
        .default(sql`extract(epoch from now())`),
    username: char('username', { length: 100 }).notNull().unique(),
    email: char('email', { length: 100 }).notNull().unique(),
    name: text('name').notNull(),
    role: roleEnum('role')
        .default('member')
        .notNull(),
    avatar: text('avatar'),
})

export type User = typeof userTable.$inferSelect

export const authenticationTable = pgTable('authentications', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    created_at: integer('created_at')
        .notNull()
        .default(sql`extract(epoch from now())`),
    updated_at: integer('updated_at')
        .notNull()
        .default(sql`extract(epoch from now())`),
    user: integer('user').references(() => userTable.id, { onDelete: 'cascade' }),
    hash_password: text('hash_password').notNull(),
    refresh_token: text('refresh_token'),
})

export type Authentication = typeof authenticationTable.$inferSelect

export const recordingTable = pgTable('recordings', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    created_at: integer('created_at')
        .notNull()
        .default(sql`extract(epoch from now())`),
    updated_at: integer('updated_at')
        .notNull()
        .default(sql`extract(epoch from now())`),
    user: integer('user').references(() => userTable.id, { onDelete: 'cascade' }),
    file_url: text('file_url').notNull(),
    note: text('note'),
    chapter_id: integer('chapter_id')
})

export type Recording = typeof recordingTable.$inferSelect

export const streakTable = pgTable('streaks', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    user: integer('user').references(() => userTable.id, { onDelete: 'cascade' }),
    current_streak: integer('current_streak').notNull().default(0),
    longest_streak: integer('longest_streak').notNull().default(0),
    last_recorded_at: integer('last_recorded_at'),
})

export type Streak = typeof streakTable.$inferSelect
