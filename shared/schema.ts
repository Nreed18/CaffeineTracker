import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const periods = pgTable("periods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  hidden: integer("hidden").notNull().default(0),
});

export const drinkEntries = pgTable("drink_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  periodId: varchar("period_id").notNull(),
  drinkName: text("drink_name").notNull(),
  caffeineAmount: integer("caffeine_amount").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

const basePeriodSchema = createInsertSchema(periods).omit({
  id: true,
  hidden: true,
});

export const insertPeriodSchema = basePeriodSchema.extend({
  startDate: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
  endDate: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
});

export const insertDrinkEntrySchema = createInsertSchema(drinkEntries, {
  timestamp: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
}).omit({
  id: true,
});

export type Period = typeof periods.$inferSelect;
export type InsertPeriod = z.input<typeof insertPeriodSchema>;
export type DrinkEntry = typeof drinkEntries.$inferSelect;
export type InsertDrinkEntry = z.input<typeof insertDrinkEntrySchema>;
