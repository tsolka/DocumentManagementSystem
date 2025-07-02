import { documents, type Document, type InsertDocument } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, ilike, or, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  searchDocuments(params: {
    query?: string;
    category?: string;
    department?: string;
    dateFrom?: string;
    dateTo?: string;
    page: number;
    limit: number;
    sortBy: string;
  }): Promise<{ documents: Document[]; total: number }>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values({
        ...insertDocument,
        updatedAt: new Date(),
      })
      .returning();
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async searchDocuments(params: {
    query?: string;
    category?: string;
    department?: string;
    dateFrom?: string;
    dateTo?: string;
    page: number;
    limit: number;
    sortBy: string;
  }): Promise<{ documents: Document[]; total: number }> {
    const { query, category, department, dateFrom, dateTo, page, limit, sortBy } = params;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    // Text search across title, description, subject, and extracted text
    if (query) {
      whereConditions.push(
        or(
          ilike(documents.title, `%${query}%`),
          ilike(documents.description, `%${query}%`),
          ilike(documents.subject, `%${query}%`),
          ilike(documents.extractedText, `%${query}%`)
        )
      );
    }

    if (category) {
      whereConditions.push(eq(documents.category, category));
    }

    if (department) {
      whereConditions.push(eq(documents.department, department));
    }

    if (dateFrom) {
      whereConditions.push(gte(documents.documentDate, new Date(dateFrom)));
    }

    if (dateTo) {
      whereConditions.push(lte(documents.documentDate, new Date(dateTo)));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Build order by clause
    let orderBy;
    switch (sortBy) {
      case "date-desc":
        orderBy = desc(documents.documentDate);
        break;
      case "date-asc":
        orderBy = asc(documents.documentDate);
        break;
      case "title":
        orderBy = asc(documents.title);
        break;
      case "size":
        orderBy = desc(documents.fileSize);
        break;
      default:
        orderBy = desc(documents.createdAt);
    }

    // Get documents
    const documentsQuery = db
      .select()
      .from(documents)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(whereClause);

    const [docsResult, countResult] = await Promise.all([
      documentsQuery,
      countQuery
    ]);

    return {
      documents: docsResult,
      total: countResult[0].count,
    };
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    // Convert documentDate string to Date if provided
    const processedUpdates = { ...updates };
    if (updates.documentDate && typeof updates.documentDate === 'string') {
      processedUpdates.documentDate = new Date(updates.documentDate);
    }

    const [document] = await db
      .update(documents)
      .set({ ...processedUpdates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return document || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
