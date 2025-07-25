import type { Patient, InsertPatient, Trial, InsertTrial, PatientMatch, InsertPatientMatch } from "./schema";

export interface IStorage {
  // Patient operations
  getPatient(id: number): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  
  // Trial operations
  getTrial(id: number): Promise<Trial | undefined>;
  getTrialByTrialId(trialId: string): Promise<Trial | undefined>;
  getAllTrials(): Promise<Trial[]>;
  createTrial(trial: InsertTrial): Promise<Trial>;
  
  // Match operations
  getPatientMatches(patientId: number): Promise<PatientMatch[]>;
  getTrialMatches(trialId: number): Promise<PatientMatch[]>;
  getAllMatches(): Promise<PatientMatch[]>;
  createMatch(match: InsertPatientMatch): Promise<PatientMatch>;
  
  // Combined operations
  getPatientsWithMatches(): Promise<(Patient & { bestMatch?: string; matchPercentage?: number; status?: string })[]>;
}

export class MemStorage implements IStorage {
  private patients = new Map<number, Patient>();
  private trials = new Map<number, Trial>();
  private matches = new Map<number, PatientMatch>();
  private currentPatientId = 1;
  private currentTrialId = 1;
  private currentMatchId = 1;

  constructor() {
    console.log('📊 Memory storage initialized');
  }

  // Patient methods
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const id = this.currentPatientId++;
    const newPatient: Patient = {
      ...patient,
      id,
      createdAt: new Date(),
    };
    this.patients.set(id, newPatient);
    return newPatient;
  }

  // Trial methods
  async getTrial(id: number): Promise<Trial | undefined> {
    return this.trials.get(id);
  }

  async getTrialByTrialId(trialId: string): Promise<Trial | undefined> {
    return Array.from(this.trials.values()).find(t => t.trialId === trialId);
  }

  async getAllTrials(): Promise<Trial[]> {
    return Array.from(this.trials.values());
  }

  async createTrial(trial: InsertTrial): Promise<Trial> {
    const id = this.currentTrialId++;
    const newTrial: Trial = {
      ...trial,
      id,
      createdAt: new Date(),
    };
    this.trials.set(id, newTrial);
    return newTrial;
  }

  // Match methods
  async getPatientMatches(patientId: number): Promise<PatientMatch[]> {
    return Array.from(this.matches.values()).filter(m => m.patientId === patientId);
  }

  async getTrialMatches(trialId: number): Promise<PatientMatch[]> {
    return Array.from(this.matches.values()).filter(m => m.trialId === trialId);
  }

  async getAllMatches(): Promise<PatientMatch[]> {
    return Array.from(this.matches.values());
  }

  async createMatch(match: InsertPatientMatch): Promise<PatientMatch> {
    const existing = Array.from(this.matches.values()).find(
      m => m.patientId === match.patientId && m.trialId === match.trialId
    );
    if (existing) this.matches.delete(existing.id);

    const id = this.currentMatchId++;
    const newMatch: PatientMatch = {
      ...match,
      id,
      createdAt: new Date(),
    };
    this.matches.set(id, newMatch);
    return newMatch;
  }

  async getPatientsWithMatches() {
    const patients = await this.getAllPatients();
    const matches = await this.getAllMatches();
    const trials = await this.getAllTrials();

    return patients.map(patient => {
      const patientMatches = matches.filter(m => m.patientId === patient.id);
      if (patientMatches.length === 0) return { ...patient, bestMatch: "None", matchPercentage: 0, status: "No Match" };

      const bestMatch = patientMatches.reduce((best, current) => 
        current.matchPercentage > best.matchPercentage ? current : best
      );
      const trial = trials.find(t => t.id === bestMatch.trialId);

      return {
        ...patient,
        bestMatch: trial?.trialId || "Unknown",
        matchPercentage: bestMatch.matchPercentage,
        status: bestMatch.status,
      };
    });
  }
}

export const storage = new MemStorage();