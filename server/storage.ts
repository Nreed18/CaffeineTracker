import { type Period, type InsertPeriod, type DrinkEntry, type InsertDrinkEntry } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getPeriod(id: string): Promise<Period | undefined>;
  getAllPeriods(): Promise<Period[]>;
  createPeriod(period: InsertPeriod): Promise<Period>;
  updatePeriod(id: string, period: InsertPeriod): Promise<Period | undefined>;
  deletePeriod(id: string): Promise<boolean>;
  
  getDrinkEntry(id: string): Promise<DrinkEntry | undefined>;
  getAllDrinkEntries(): Promise<DrinkEntry[]>;
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

  async updatePeriod(id: string, insertPeriod: InsertPeriod): Promise<Period | undefined> {
    const existing = this.periods.get(id);
    if (!existing) return undefined;
    
    const updated: Period = { ...insertPeriod, id };
    this.periods.set(id, updated);
    return updated;
  }

  async deletePeriod(id: string): Promise<boolean> {
    return this.periods.delete(id);
  }

  async getDrinkEntry(id: string): Promise<DrinkEntry | undefined> {
    return this.drinkEntries.get(id);
  }

  async getAllDrinkEntries(): Promise<DrinkEntry[]> {
    return Array.from(this.drinkEntries.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
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
