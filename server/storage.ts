import { type Period, type InsertPeriod, type DrinkEntry, type InsertDrinkEntry, periods, drinkEntries } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getPeriod(id: string): Promise<Period | undefined>;
  getAllPeriods(): Promise<Period[]>;
  createPeriod(period: InsertPeriod): Promise<Period>;
  updatePeriod(id: string, period: InsertPeriod): Promise<Period | undefined>;
  togglePeriodHidden(id: string, hidden: boolean): Promise<Period | undefined>;
  deletePeriod(id: string): Promise<boolean>;
  
  getDrinkEntry(id: string): Promise<DrinkEntry | undefined>;
  getAllDrinkEntries(): Promise<DrinkEntry[]>;
  getDrinkEntriesByPeriod(periodId: string): Promise<DrinkEntry[]>;
  createDrinkEntry(entry: InsertDrinkEntry): Promise<DrinkEntry>;
  deleteDrinkEntry(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getPeriod(id: string): Promise<Period | undefined> {
    const [period] = await db.select().from(periods).where(eq(periods.id, id));
    return period || undefined;
  }

  async getAllPeriods(): Promise<Period[]> {
    return await db.select().from(periods);
  }

  async createPeriod(insertPeriod: InsertPeriod): Promise<Period> {
    const [period] = await db
      .insert(periods)
      .values({
        name: insertPeriod.name,
        startDate: typeof insertPeriod.startDate === 'string' ? new Date(insertPeriod.startDate) : insertPeriod.startDate,
        endDate: typeof insertPeriod.endDate === 'string' ? new Date(insertPeriod.endDate) : insertPeriod.endDate,
      })
      .returning();
    return period;
  }

  async updatePeriod(id: string, insertPeriod: InsertPeriod): Promise<Period | undefined> {
    const [period] = await db
      .update(periods)
      .set({
        name: insertPeriod.name,
        startDate: typeof insertPeriod.startDate === 'string' ? new Date(insertPeriod.startDate) : insertPeriod.startDate,
        endDate: typeof insertPeriod.endDate === 'string' ? new Date(insertPeriod.endDate) : insertPeriod.endDate,
      })
      .where(eq(periods.id, id))
      .returning();
    return period || undefined;
  }

  async togglePeriodHidden(id: string, hidden: boolean): Promise<Period | undefined> {
    const [period] = await db
      .update(periods)
      .set({ hidden: hidden ? 1 : 0 })
      .where(eq(periods.id, id))
      .returning();
    return period || undefined;
  }

  async deletePeriod(id: string): Promise<boolean> {
    const result = await db.delete(periods).where(eq(periods.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getDrinkEntry(id: string): Promise<DrinkEntry | undefined> {
    const [entry] = await db.select().from(drinkEntries).where(eq(drinkEntries.id, id));
    return entry || undefined;
  }

  async getAllDrinkEntries(): Promise<DrinkEntry[]> {
    return await db.select().from(drinkEntries).orderBy(desc(drinkEntries.timestamp));
  }

  async getDrinkEntriesByPeriod(periodId: string): Promise<DrinkEntry[]> {
    return await db
      .select()
      .from(drinkEntries)
      .where(eq(drinkEntries.periodId, periodId))
      .orderBy(desc(drinkEntries.timestamp));
  }

  async createDrinkEntry(insertEntry: InsertDrinkEntry): Promise<DrinkEntry> {
    const values: any = {
      periodId: insertEntry.periodId,
      drinkName: insertEntry.drinkName,
      caffeineAmount: insertEntry.caffeineAmount,
    };
    
    // If timestamp is provided, use it; otherwise, use default (now)
    if (insertEntry.timestamp) {
      values.timestamp = typeof insertEntry.timestamp === 'string' 
        ? new Date(insertEntry.timestamp) 
        : insertEntry.timestamp;
    }
    
    const [entry] = await db
      .insert(drinkEntries)
      .values(values)
      .returning();
    return entry;
  }

  async deleteDrinkEntry(id: string): Promise<boolean> {
    const result = await db.delete(drinkEntries).where(eq(drinkEntries.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
