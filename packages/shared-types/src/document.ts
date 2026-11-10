import type { UUID } from "./index";

export interface MedicalDocument {
  id: UUID;
  user_id: UUID;
  filename: string;
  document_type: string;
  file_url: string;
  file_size: number; // bytes
  uploaded_at: string; // ISO datetime
  shared_with: string[];
}

export interface DocumentShareLink {
  document_id: UUID;
  share_url: string;
  expires_at: string; // ISO datetime
}
