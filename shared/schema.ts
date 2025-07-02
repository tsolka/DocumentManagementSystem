import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subject: text("subject"),
  tags: text("tags").array(),
  category: text("category").notNull(),
  department: text("department"),
  documentDate: timestamp("document_date"),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  extractedText: text("extracted_text"),
  ocrProcessed: boolean("ocr_processed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const metadataSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  subject: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  department: z.string().optional(),
  documentDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  tags: z.array(z.string()).optional(),
});

export const searchDocumentSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  department: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.enum(["relevance", "date-desc", "date-asc", "title", "size"]).default("relevance"),
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type SearchDocuments = z.infer<typeof searchDocumentSchema>;
