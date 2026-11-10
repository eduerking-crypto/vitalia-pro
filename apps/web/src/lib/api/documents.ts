import type { DocumentShareLink, MedicalDocument } from "@vitalia/shared-types";
import { api } from "./client";

export async function fetchDocuments(): Promise<MedicalDocument[]> {
  const { data } = await api.get<MedicalDocument[]>("/documents");
  return data;
}

export async function uploadDocument(input: {
  filename: string;
  document_type: string;
  file_size: number;
}): Promise<MedicalDocument> {
  const { data } = await api.post<MedicalDocument>("/documents", input);
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}`);
}

export async function shareDocument(id: string): Promise<DocumentShareLink> {
  const { data } = await api.post<DocumentShareLink>("/documents/share", {
    document_id: id,
  });
  return data;
}
