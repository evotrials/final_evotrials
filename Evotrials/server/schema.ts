import { z } from "zod";

// Core data interfaces
export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  condition: string;
  medication: string;
  location: string;
  createdAt: Date;
}

export interface Trial {
  id: number;
  trialId: string;
  ageMin: number;
  ageMax: number;
  gender: string;
  targetCondition: string;
  requiredMedication: string;
  locations: string;
  createdAt: Date;
}

export interface PatientMatch {
  id: number;
  patientId: number;
  trialId: number;
  matchPercentage: number;
  status: string;
  createdAt: Date;
}

// Validation schemas
export const insertPatientSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  age: z.number().min(1, "Age must be at least 1").max(120),
  gender: z.string().min(1, "Gender is required").max(50),
  condition: z.string().min(1, "Medical condition is required").max(200),
  medication: z.string().min(1, "Current medication is required").max(300),
  location: z.string().min(1, "Location is required").max(100),
});

export const insertTrialSchema = z.object({
  trialId: z.string().min(1, "Trial ID is required").max(50),
  ageMin: z.number().min(1, "Minimum age must be at least 1").max(120),
  ageMax: z.number().min(1, "Maximum age must be at least 1").max(120),
  gender: z.string().min(1, "Gender requirement is required").max(50),
  targetCondition: z.string().min(1, "Target condition is required").max(200),
  requiredMedication: z.string().min(1, "Required medication is required").max(300),
  locations: z.string().min(1, "Trial locations are required").max(500),
}).refine(data => data.ageMin <= data.ageMax, {
  message: "Minimum age must be ≤ maximum age",
  path: ["ageMax"],
});

export const insertPatientMatchSchema = z.object({
  patientId: z.number().positive("Patient ID must be positive"),
  trialId: z.number().positive("Trial ID must be positive"),
  matchPercentage: z.number().min(0).max(100),
  status: z.enum(["Matched", "Low Match", "No Match"]),
});

// Type exports
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertTrial = z.infer<typeof insertTrialSchema>;
export type InsertPatientMatch = z.infer<typeof insertPatientMatchSchema>;

// Admin auth
export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});
export type AdminLogin = z.infer<typeof adminLoginSchema>;

// Form options
export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "All", label: "All Genders" }
] as const;

export const MATCH_STATUS_OPTIONS = [
  { value: "Matched", label: "Matched (70%+)", color: "green" },
  { value: "Low Match", label: "Low Match (40-69%)", color: "yellow" },
  { value: "No Match", label: "No Match (<40%)", color: "red" }
] as const;