import { Express } from "express";
import { storage } from "./storage";
import { 
  insertPatientSchema, 
  insertTrialSchema, 
  adminLoginSchema,
  calculateMatchPercentage
} from "./schema";
import { z } from "zod";

export function registerRoutes(app: Express) {
  
  // Admin Auth
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = adminLoginSchema.parse(req.body);
      const validPassword = process.env.ADMIN_PASSWORD || "admin123";
      
      if (password === validPassword) {
        res.json({ success: true });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(400).json({ success: false, message: "Invalid request" });
    }
  });

  // Patient Routes
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getPatientsWithMatches();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      
      // Calculate matches
      const trials = await storage.getAllTrials();
      for (const trial of trials) {
        const matchPercentage = calculateMatchPercentage(patient, trial);
        const status = matchPercentage >= 70 ? "Matched" : 
                      matchPercentage >= 40 ? "Low Match" : "No Match";
        
        await storage.createMatch({
          patientId: patient.id,
          trialId: trial.id,
          matchPercentage,
          status,
        });
      }
      
      res.json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create patient" });
      }
    }
  });

  // Trial Routes
  app.get("/api/trials", async (req, res) => {
    try {
      const trials = await storage.getAllTrials();
      res.json(trials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trials" });
    }
  });

  app.post("/api/trials", async (req, res) => {
    try {
      const trialData = insertTrialSchema.parse(req.body);
      const trial = await storage.createTrial(trialData);
      
      // Recalculate all patient matches
      const patients = await storage.getAllPatients();
      for (const patient of patients) {
        const matchPercentage = calculateMatchPercentage(patient, trial);
        const status = matchPercentage >= 70 ? "Matched" : 
                      matchPercentage >= 40 ? "Low Match" : "No Match";
        
        await storage.createMatch({
          patientId: patient.id,
          trialId: trial.id,
          matchPercentage,
          status,
        });
      }
      
      res.json(trial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create trial" });
      }
    }
  });

  // Analytics
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const [patients, trials, matches] = await Promise.all([
        storage.getAllPatients(),
        storage.getAllTrials(),
        storage.getAllMatches()
      ]);
      
      const matched = matches.filter(m => m.status === "Matched").length;
      const matchRate = patients.length > 0 ? (matched / patients.length * 100).toFixed(1) : "0";
      
      res.json({
        totalPatients: patients.length,
        activeTrials: trials.length,
        matchedPatients: matched,
        matchRate: `${matchRate}%`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to load analytics" });
    }
  });
}