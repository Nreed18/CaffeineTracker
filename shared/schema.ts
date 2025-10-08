import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const periods = pgTable("periods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
});

export const drinkEntries = pgTable("drink_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  periodId: varchar("period_id").notNull(),
  drinkName: text("drink_name").notNull(),
  caffeineAmount: integer("caffeine_amount").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertPeriodSchema = createInsertSchema(periods).omit({
  id: true,
});

export const insertDrinkEntrySchema = createInsertSchema(drinkEntries).omit({
  id: true,
  timestamp: true,
});

export type Period = typeof periods.$inferSelect;
export type InsertPeriod = z.infer<typeof insertPeriodSchema>;
export type DrinkEntry = typeof drinkEntries.$inferSelect;
export type InsertDrinkEntry = z.infer<typeof insertDrinkEntrySchema>;
