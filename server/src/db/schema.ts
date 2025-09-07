import { serial, text, pgTable, timestamp, json } from 'drizzle-orm/pg-core';

export const profileTable = pgTable('profile', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  greeting: text('greeting').notNull(),
  email: text('email').notNull(),
  linkedin_url: text('linkedin_url'), // Nullable by default
  whatsapp_number: text('whatsapp_number'), // Nullable by default
  about_description: text('about_description').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const skillsTable = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const projectsTable = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  image_url: text('image_url'), // Nullable by default
  github_url: text('github_url'), // Nullable by default
  demo_url: text('demo_url'), // Nullable by default
  technologies: json('technologies').notNull(), // Array of strings stored as JSON
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schemas
export type Profile = typeof profileTable.$inferSelect;
export type NewProfile = typeof profileTable.$inferInsert;
export type Skill = typeof skillsTable.$inferSelect;
export type NewSkill = typeof skillsTable.$inferInsert;
export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;

// Important: Export all tables for proper query building
export const tables = { 
  profile: profileTable,
  skills: skillsTable,
  projects: projectsTable
};