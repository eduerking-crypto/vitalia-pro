import type { UUID } from "./index";

export type UserRole = "patient" | "doctor" | "admin";
export type BiologicalSex = "male" | "female" | "intersex" | "unspecified";

export interface User {
  id: UUID;
  email: string;
  full_name: string;
  date_of_birth: string; // ISO date (YYYY-MM-DD)
  biological_sex: BiologicalSex;
  role: UserRole;
  is_active: boolean;
  mfa_enabled: boolean;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number; // segundos
}

export interface AuthResponse extends AuthTokens {
  user: User;
  mfa_required?: boolean;
}

export interface Allergy {
  id: UUID;
  profile_id: UUID;
  allergen: string;
  severity: "mild" | "moderate" | "severe" | "life-threatening";
  reaction: string;
}

export interface MedicalProfile {
  id: UUID;
  user_id: UUID;
  blood_type: string;
  height_cm: number;
  weight_kg: number;
  chronic_conditions: string[];
  family_history: string[];
  emergency_contact_name: string;
  emergency_contact_phone: string;
  insurance_provider: string;
  insurance_policy: string;
  allergies: Allergy[];
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  language: "es" | "en";
  notifications: {
    medications: boolean;
    appointments: boolean;
    achievements: boolean;
    weekly_report: boolean;
  };
  units: {
    weight: "kg" | "lb";
    temperature: "c" | "f";
    distance: "km" | "mi";
  };
  privacy: {
    share_anonymized_data: boolean;
    allow_ai_suggestions: boolean;
  };
}
