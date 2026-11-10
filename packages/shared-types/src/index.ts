/**
 * Tipos compartidos VITALIA PRO.
 * Espejan los esquemas Pydantic de la API (apps/api) y se consumen desde la web (apps/web).
 */
export * from "./user";
export * from "./medication";
export * from "./meal";
export * from "./appointment";
export * from "./chat";
export * from "./health";
export * from "./labs";
export * from "./document";
export * from "./notification";

/** Identificador UUID estándar. */
export type UUID = string;

/** Paginación estándar de la API. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
