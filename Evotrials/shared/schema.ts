```typescript
import { z } from "zod";

// Core data interfaces
export interface Patient {
  id: number;
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
  locations: string; // comma-separated cities
  createdAt: Date;
}

export interface PatientMatch {
  id: number;
  patientId: number;
  trialId: number;
  matchPercentage: number;
  status: string; // "Matched", "Low Match", "No Match"
  createdAt: Date;
}

// Validation schemas
export const insertPatientSchema = z.object({
  age: z.number()
    .min(1, "Age must be at least 1")
    .max(120, "Age must be less than 120"),
  gender: z.string()
    .min(1, "Gender is required")
    .max(50, "Gender must be less than 50 characters"),
  condition: z.string()
    .min(1, "Medical condition is required")
    .max(200, "Condition must be less than 200 characters"),
  medication: z.string()
    .min(1, "Current medication is required")
    .max(300, "Medication must be less than 300 characters"),
  location: z.string()
    .min(1, "Location is required")
    .max(100, "Location must be less than 100 characters"),
});

export const insertTrialSchema = z.object({
  trialId: z.string()
    .min(1, "Trial ID is required")
    .max(50, "Trial ID must be less than 50 characters"),
  ageMin: z.number()
    .min(1, "Minimum age must be at least 1")
    .max(120, "Minimum age must be less than 120"),
  ageMax: z.number()
    .min(1, "Maximum age must be at least 1")
    .max(120, "Maximum age must be less than 120"),
  gender: z.string()
    .min(1, "Gender requirement is required")
    .max(50, "Gender must be less than 50 characters"),
  targetCondition: z.string()
    .min(1, "Target condition is required")
    .max(200, "Target condition must be less than 200 characters"),
  requiredMedication: z.string()
    .min(1, "Required medication is required")
    .max(300, "Required medication must be less than 300 characters"),
  locations: z.string()
    .min(1, "Trial locations are required")
    .max(500, "Locations must be less than 500 characters"),
}).refine((data) => data.ageMin <= data.ageMax, {
  message: "Minimum age must be less than or equal to maximum age",
  path: ["ageMax"],
});

export const insertPatientMatchSchema = z.object({
  patientId: z.number().positive("Patient ID must be positive"),
  trialId: z.number().positive("Trial ID must be positive"),
  matchPercentage: z.number()
    .min(0, "Match percentage cannot be negative")
    .max(100, "Match percentage cannot exceed 100"),
  status: z.enum(["Matched", "Low Match", "No Match"], {
    errorMap: () => ({ message: "Status must be 'Matched', 'Low Match', or 'No Match'" })
  }),
});

// Type exports
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertTrial = z.infer<typeof insertTrialSchema>;
export type InsertPatientMatch = z.infer<typeof insertPatientMatchSchema>;

// Admin authentication schema
export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type AdminLogin = z.infer<typeof adminLoginSchema>;

// Gender options for forms
export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "All", label: "All Genders" }
] as const;

// Match status options
export const MATCH_STATUS_OPTIONS = [
  { value: "Matched", label: "Matched (70%+)", color: "green" },
  { value: "Low Match", label: "Low Match (40-69%)", color: "yellow" },
  { value: "No Match", label: "No Match (<40%)", color: "red" }
] as const;
```