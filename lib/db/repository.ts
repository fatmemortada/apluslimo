// ============================================================
// ChauffeurOS — Base Repository Class
// Generic CRUD operations on the normalized store
// ============================================================

import { db, generateId, queryAll, paginate } from "./store";
import type { QueryParams, PaginatedResponse } from "@/lib/types";

type CollectionName = keyof typeof db;

export abstract class Repository<T extends { id: string; organizationId: string }> {
  constructor(
    protected collectionName: CollectionName,
    protected idPrefix: string
  ) {}

  private get collection(): Map<string, T> {
    return db[this.collectionName] as unknown as Map<string, T>;
  }

  findById(id: string): T | undefined {
    return this.collection.get(id);
  }

  findByOrg(orgId: string, filters?: QueryParams): T[] {
    return queryAll(this.collection, orgId, filters as Record<string, unknown>);
  }

  findPaginated(
    orgId: string,
    params: QueryParams = {}
  ): PaginatedResponse<T> {
    const items = this.findByOrg(orgId, params);
    let sorted = [...items];
    if (params.sort) {
      const key = params.sort;
      const order = params.order === "desc" ? -1 : 1;
      sorted.sort((a, b) => {
        const va = (a as Record<string, unknown>)[key];
        const vb = (b as Record<string, unknown>)[key];
        if (typeof va === "number" && typeof vb === "number")
          return (va - vb) * order;
        return String(va).localeCompare(String(vb)) * order;
      });
    }
    return paginate(sorted, params.page, params.pageSize);
  }

  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): T {
    const now = new Date().toISOString();
    const id = generateId(this.idPrefix);
    const entity = { ...data, id, createdAt: now, updatedAt: now } as unknown as T;
    this.collection.set(id, entity);
    return entity;
  }

  update(id: string, data: Partial<T>): T | undefined {
    const existing = this.collection.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() } as T;
    this.collection.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.collection.delete(id);
  }

  count(orgId: string, filters?: QueryParams): number {
    return this.findByOrg(orgId, filters).length;
  }

  // Resolve foreign key relations
  protected resolve<Target>(
    collectionName: CollectionName,
    id: string | undefined
  ): Target | undefined {
    if (!id) return undefined;
    const col = db[collectionName] as Map<string, Target>;
    return col.get(id);
  }

  protected resolveMany<Target>(
    collectionName: CollectionName,
    orgId: string,
    foreignKey: string,
    value: string
  ): Target[] {
    const col = db[collectionName] as Map<string, Target>;
    return Array.from(col.values()).filter(
      (item: unknown) =>
        (item as Record<string, unknown>).organizationId === orgId &&
        (item as Record<string, unknown>)[foreignKey] === value
    ) as Target[];
  }
}
