import { type Period, type InsertPeriod, type DrinkEntry, type InsertDrinkEntry } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getPeriod(id: string): Promise<Period | undefined>;
  getAllPeriods(): Promise<Period[]>;
  createPeriod(period: InsertPeriod): Promise<Period>;
  
  getDrinkEntry(id: string): Promise<DrinkEntry | undefined>;
  getDrinkEntriesByPeriod(periodId: string): Promise<DrinkEntry[]>;
  createDrinkEntry(entry: InsertDrinkEntry): Promise<DrinkEntry>;
}

export class MemStorage implements IStorage {
  private periods: Map<string, Period>;
  private drinkEntries: Map<string, DrinkEntry>;

  constructor() {
    this.periods = new Map();
    this.drinkEntries = new Map();
  }

  async getPeriod(id: string): Promise<Period | undefined> {
    return this.periods.get(id);
  }

  async getAllPeriods(): Promise<Period[]> {
    return Array.from(this.periods.values());
  }

  async createPeriod(insertPeriod: InsertPeriod): Promise<Period> {
    const id = randomUUID();
    const period: Period = { ...insertPeriod, id };
    this.periods.set(id, period);
    return period;
  }

  async getDrinkEntry(id: string): Promise<DrinkEntry | undefined> {
    return this.drinkEntries.get(id);
  }

  async getDrinkEntriesByPeriod(periodId: string): Promise<DrinkEntry[]> {
    return Array.from(this.drinkEntries.values()).filter(
      (entry) => entry.periodId === periodId
    );
  }

  async createDrinkEntry(insertEntry: InsertDrinkEntry): Promise<DrinkEntry> {
    const id = randomUUID();
    const entry: DrinkEntry = {
      ...insertEntry,
      id,
      timestamp: new Date(),
    };
    this.drinkEntries.set(id, entry);
    return entry;
  }
}

export const storage = new MemStorage();
