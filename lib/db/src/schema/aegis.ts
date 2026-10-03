import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const aegisProfileTable = pgTable("aegis_profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("older_adult"),
  phone: text("phone"),
  accessibilityLargeText: boolean("accessibility_large_text").notNull().default(false),
  reducedMotion: boolean("reduced_motion").notNull().default(false),
});

export const aegisFamilyTable = pgTable("aegis_family", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  initials: text("initials").notNull(),
  contact: text("contact").notNull(),
  canSeeCheckIns: boolean("can_see_check_ins").notNull().default(true),
  canSeeRequests: boolean("can_see_requests").notNull().default(true),
  lastCheckIn: text("last_check_in"),
  status: text("status").notNull().default("available"),
});

export const aegisCheckInsTable = pgTable("aegis_check_ins", {
  id: serial("id").primaryKey(),
  status: text("status").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aegisHelpRequestsTable = pgTable("aegis_help_requests", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  preferredTime: text("preferred_time"),
  status: text("status").notNull().default("Requested"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aegisServicesTable = pgTable("aegis_services", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  preferredTime: text("preferred_time"),
  status: text("status").notNull().default("Requested"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aegisHealthItemsTable = pgTable("aegis_health_items", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  dueLabel: text("due_label").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const aegisNotificationsTable = pgTable("aegis_notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  timeLabel: text("time_label").notNull(),
  read: boolean("read").notNull().default(false),
  kind: text("kind").notNull(),
});

export const aegisPermissionsTable = pgTable("aegis_permissions", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  enabled: boolean("enabled").notNull().default(false),
  category: text("category").notNull(),
});

export const aegisActivityTable = pgTable("aegis_activity", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  timeLabel: text("time_label").notNull(),
  kind: text("kind").notNull(),
});

export const aegisEmergencyAlertsTable = pgTable("aegis_emergency_alerts", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  contactIds: integer("contact_ids").array().notNull().default([]),
  notified: jsonb("notified").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAegisProfileSchema = createInsertSchema(aegisProfileTable).omit({ id: true });
export const insertAegisFamilySchema = createInsertSchema(aegisFamilyTable).omit({ id: true });
export const insertAegisCheckInSchema = createInsertSchema(aegisCheckInsTable).omit({ id: true, createdAt: true });
export const insertAegisHelpRequestSchema = createInsertSchema(aegisHelpRequestsTable).omit({ id: true, createdAt: true });
export const insertAegisServiceSchema = createInsertSchema(aegisServicesTable).omit({ id: true, createdAt: true });
export const insertAegisHealthItemSchema = createInsertSchema(aegisHealthItemsTable).omit({ id: true });
export const insertAegisNotificationSchema = createInsertSchema(aegisNotificationsTable).omit({ id: true });
export const insertAegisPermissionSchema = createInsertSchema(aegisPermissionsTable).omit({ id: true });
export const insertAegisActivitySchema = createInsertSchema(aegisActivityTable).omit({ id: true });
export const insertAegisEmergencyAlertSchema = createInsertSchema(aegisEmergencyAlertsTable).omit({ id: true, createdAt: true });

export type AegisProfile = typeof aegisProfileTable.$inferSelect;
export type AegisFamily = typeof aegisFamilyTable.$inferSelect;
export type AegisCheckIn = typeof aegisCheckInsTable.$inferSelect;
export type AegisHelpRequest = typeof aegisHelpRequestsTable.$inferSelect;
export type AegisService = typeof aegisServicesTable.$inferSelect;
export type AegisHealthItem = typeof aegisHealthItemsTable.$inferSelect;
export type AegisNotification = typeof aegisNotificationsTable.$inferSelect;
export type AegisPermission = typeof aegisPermissionsTable.$inferSelect;
export type AegisActivity = typeof aegisActivityTable.$inferSelect;
export type AegisEmergencyAlert = typeof aegisEmergencyAlertsTable.$inferSelect;

export type AegisRole = z.infer<typeof insertAegisProfileSchema>["role"];