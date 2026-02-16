// src/lib/db.ts
// Utilidad para acceder a Cloudflare D1

import { getCloudflareContext } from "@opennextjs/cloudflare";

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Results<T>>;
}

interface D1Result {
  success: boolean;
  meta: object;
}

interface D1Results<T> {
  results: T[];
  success: boolean;
  meta: object;
}

export async function getDB(): Promise<D1Database> {
  const { env } = await getCloudflareContext();
  return (env as Record<string, D1Database>).kolma2crm_db;
}

export function generateId(prefix: string = ""): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}