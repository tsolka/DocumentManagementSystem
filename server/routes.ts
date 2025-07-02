import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, searchDocumentSchema, metadataSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import tesseract from "node-tesseract-ocr";
import mammoth from "mammoth";
import sharp from "sharp";
import { ocrQueue } from "./queue";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not supported"));
    }
  },
});

// Enhanced text extraction function with real OCR
async function extractText(filePath: string, mimeType: string): Promise<string> {
  try {
    console.log(`Extracting text from ${filePath} (${mimeType})`);
    
    // Extract text from images using OCR
    if (mimeType.startsWith("image/")) {
      console.log("Processing image with OCR...");
      
      // Convert image to better format for OCR if needed
      let processedPath = filePath;
      if (mimeType === "image/png" || mimeType === "image/jpeg") {
        try {
          const processedBuffer = await sharp(filePath)
            .greyscale()
            .normalize()
            .sharpen()
            .png()
            .toBuffer();
          
          const tempPath = filePath + '_processed.png';
          fs.writeFileSync(tempPath, processedBuffer);
          processedPath = tempPath;
        } catch (sharpError) {
          console.log("Image preprocessing failed, using original:", sharpError);
        }
      }
      
      const config = {
        lang: "por+eng", // Portuguese and English
        oem: 1,
        psm: 3,
      };
      
      const text = await tesseract.recognize(processedPath, config);
      
      // Clean up processed file
      if (processedPath !== filePath && fs.existsSync(processedPath)) {
        fs.unlinkSync(processedPath);
      }
      
      return text.trim();
    }
    
    // Extract text from PDFs (simplified for now)
    if (mimeType === "application/pdf") {
      console.log("Processing PDF...");
      // For now, return placeholder - PDF text extraction will be implemented later
      return "PDF detectado - processamento de texto em desenvolvimento";
    }
    
    // Extract text from Word documents
    if (mimeType.includes("wordprocessingml") || 
        mimeType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml")) {
      console.log("Processing Word document...");
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }
    
    // Handle other Office documents
    if (mimeType.includes("document") || mimeType.includes("word") || 
        mimeType.includes("msword")) {
      console.log("Processing Office document...");
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
      } catch (mammothError) {
        console.log("Mammoth failed, document may be older format:", mammothError);
        return "Documento Office detectado - texto requer processamento adicional";
      }
    }
    
    console.log("Unsupported file type for text extraction:", mimeType);
    return "";
  } catch (error) {
    console.error("Text extraction error:", error);
    return `Erro na extração de texto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload documents
  app.post("/api/documents", upload.array("files"), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const metadata = JSON.parse(req.body.metadata || "{}");
      const validatedMetadata = metadataSchema.parse(metadata);

      const uploadedDocuments = [];

      for (const file of files) {
        // Move file to permanent location
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        fs.renameSync(file.path, filePath);

        // Perform quick text extraction for immediate indexing
        const quickText = await extractText(filePath, file.mimetype);

        // Create document record with initial text extraction
        const document = await storage.createDocument({
          ...validatedMetadata,
          fileName,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          filePath,
          extractedText: quickText,
          ocrProcessed: false, // Will be updated when OCR queue completes
        });

        // Add to OCR queue for advanced processing if needed
        if (file.mimetype.startsWith("image/") || 
            (file.mimetype === "application/pdf" && (!quickText || quickText.length < 100))) {
          console.log(`Adding document ${document.id} to OCR queue for advanced processing`);
          ocrQueue.addJob(document.id, filePath, file.mimetype);
        }

        uploadedDocuments.push(document);
      }

      res.json({ documents: uploadedDocuments });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Upload failed" });
    }
  });

  // Search documents
  app.get("/api/documents", async (req, res) => {
    try {
      const searchParams = searchDocumentSchema.parse({
        query: req.query.query,
        category: req.query.category,
        department: req.query.department,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        sortBy: req.query.sortBy || "relevance",
      });

      const result = await storage.searchDocuments(searchParams);
      res.json(result);
    } catch (error) {
      console.error("Search error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Search failed" });
    }
  });

  // Get single document
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json(document);
    } catch (error) {
      res.status(400).json({ message: "Invalid document ID" });
    }
  });

  // Download document
  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (!fs.existsSync(document.filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      res.download(document.filePath, document.originalName);
    } catch (error) {
      res.status(500).json({ message: "Download failed" });
    }
  });

  // Update document metadata
  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const document = await storage.updateDocument(id, updates);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json(document);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Update failed" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Delete file from disk
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }

      const deleted = await storage.deleteDocument(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Delete failed" });
    }
  });

  // OCR Queue Management Endpoints
  app.get("/api/ocr/status", async (req, res) => {
    try {
      const status = ocrQueue.getQueueStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to get queue status" });
    }
  });

  app.get("/api/ocr/job/:jobId", async (req, res) => {
    try {
      const jobId = req.params.jobId;
      const job = ocrQueue.getJobStatus(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to get job status" });
    }
  });

  // Reprocess document with OCR
  app.post("/api/documents/:id/reprocess", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (!fs.existsSync(document.filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      // Add to OCR queue for reprocessing
      const jobId = ocrQueue.addJob(document.id, document.filePath, document.mimeType);
      
      res.json({ 
        message: "Document queued for reprocessing",
        jobId 
      });
    } catch (error) {
      res.status(500).json({ message: "Reprocessing failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
