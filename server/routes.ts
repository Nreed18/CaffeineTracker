import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPeriodSchema, insertDrinkEntrySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/periods", async (req, res) => {
    try {
      const periods = await storage.getAllPeriods();
      res.json(periods);
    } catch (error) {
      console.error("Error fetching periods:", error);
      res.status(500).json({ error: "Failed to fetch periods" });
    }
  });

  app.post("/api/periods", async (req, res) => {
    try {
      const data = insertPeriodSchema.parse(req.body);
      const period = await storage.createPeriod(data);
      res.status(201).json(period);
    } catch (error) {
      console.error("Error with period data:", error);
      res.status(400).json({ error: "Invalid period data" });
    }
  });

  app.put("/api/periods/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertPeriodSchema.parse(req.body);
      const period = await storage.updatePeriod(id, data);
      
      if (!period) {
        return res.status(404).json({ error: "Period not found" });
      }
      
      res.json(period);
    } catch (error) {
      console.error("Error with period data:", error);
      res.status(400).json({ error: "Invalid period data" });
    }
  });

  app.patch("/api/periods/:id/toggle-hidden", async (req, res) => {
    try {
      const { id } = req.params;
      const { hidden } = req.body;

      // Validate hidden is a boolean
      if (typeof hidden !== 'boolean') {
        return res.status(400).json({ error: "Hidden must be a boolean value" });
      }

      const period = await storage.togglePeriodHidden(id, hidden);

      if (!period) {
        return res.status(404).json({ error: "Period not found" });
      }

      res.json(period);
    } catch (error) {
      console.error("Error toggling period visibility:", error);
      res.status(500).json({ error: "Failed to toggle period visibility" });
    }
  });

  app.delete("/api/periods/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePeriod(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Period not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting period:", error);
      res.status(500).json({ error: "Failed to delete period" });
    }
  });

  app.get("/api/drink-entries", async (req, res) => {
    try {
      const entries = await storage.getAllDrinkEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching drink entries:", error);
      res.status(500).json({ error: "Failed to fetch drink entries" });
    }
  });

  app.get("/api/drink-entries/period/:periodId", async (req, res) => {
    try {
      const { periodId } = req.params;
      const entries = await storage.getDrinkEntriesByPeriod(periodId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching drink entries:", error);
      res.status(500).json({ error: "Failed to fetch drink entries" });
    }
  });

  app.post("/api/drink-entries", async (req, res) => {
    try {
      const data = insertDrinkEntrySchema.parse(req.body);
      const entry = await storage.createDrinkEntry(data);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error with drink entry data:", error);
      res.status(400).json({ error: "Invalid drink entry data" });
    }
  });

  app.delete("/api/drink-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteDrinkEntry(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Drink entry not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting drink entry:", error);
      res.status(500).json({ error: "Failed to delete drink entry" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
