import {pgTable, uuid, text, timestamp, serial } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    username: text("user_id").notNull().unique(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const dietLogs = pgTable('diet_logs', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    foodName: text('food_name').notNull(),
    notes: text('notes'),
    loggedAt: timestamp('logged_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});