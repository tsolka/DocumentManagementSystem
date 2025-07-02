import { storage } from "./storage";
import fs from "fs";
import tesseract from "node-tesseract-ocr";
import mammoth from "mammoth";
import sharp from "sharp";

interface QueueJob {
  id: string;
  documentId: number;
  filePath: string;
  mimeType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  error?: string;
}

class OCRQueue {
  private queue: QueueJob[] = [];
  private processing = false;
  private maxRetries = 3;

  addJob(documentId: number, filePath: string, mimeType: string): string {
    const job: QueueJob = {
      id: `${documentId}-${Date.now()}`,
      documentId,
      filePath,
      mimeType,
      status: 'pending',
      createdAt: new Date(),
    };

    this.queue.push(job);
    console.log(`Added OCR job ${job.id} to queue`);
    
    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }

    return job.id;
  }

  private async processQueue() {
    if (this.processing) return;
    
    this.processing = true;
    console.log("Starting OCR queue processing...");

    while (this.queue.length > 0) {
      const job = this.queue.find(j => j.status === 'pending');
      if (!job) break;

      try {
        console.log(`Processing OCR job ${job.id}`);
        job.status = 'processing';
        
        const extractedText = await this.extractTextAdvanced(job.filePath, job.mimeType);
        
        // Update document in database with extracted text
        await storage.updateDocument(job.documentId, {
          extractedText,
          ocrProcessed: true,
        });

        job.status = 'completed';
        job.processedAt = new Date();
        console.log(`Completed OCR job ${job.id}`);

      } catch (error) {
        console.error(`Failed OCR job ${job.id}:`, error);
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';
        job.processedAt = new Date();
      }
    }

    // Clean up completed/failed jobs older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.queue = this.queue.filter(job => 
      job.status === 'pending' || 
      job.status === 'processing' || 
      (job.processedAt && job.processedAt > oneHourAgo)
    );

    this.processing = false;
    console.log("OCR queue processing completed");
  }

  private async extractTextAdvanced(filePath: string, mimeType: string): Promise<string> {
    try {
      console.log(`Advanced text extraction from ${filePath} (${mimeType})`);
      
      // Extract text from images using OCR
      if (mimeType.startsWith("image/")) {
        console.log("Processing image with advanced OCR...");
        
        // Convert image to better format for OCR
        let processedPath = filePath;
        try {
          const processedBuffer = await sharp(filePath)
            .greyscale()
            .normalize()
            .sharpen()
            .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
            .png()
            .toBuffer();
          
          const tempPath = filePath + '_processed.png';
          fs.writeFileSync(tempPath, processedBuffer);
          processedPath = tempPath;
        } catch (sharpError) {
          console.log("Image preprocessing failed, using original:", sharpError);
        }
        
        const config = {
          lang: "por+eng", // Portuguese and English
          oem: 1, // LSTM OCR Engine Mode
          psm: 3, // Fully automatic page segmentation
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:-()[]{}áéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ',
        };
        
        const text = await tesseract.recognize(processedPath, config);
        
        // Clean up processed file
        if (processedPath !== filePath && fs.existsSync(processedPath)) {
          fs.unlinkSync(processedPath);
        }
        
        return this.cleanOCRText(text);
      }
      
      // Extract text from PDFs (simplified for now)
      if (mimeType === "application/pdf") {
        console.log("Processing PDF with advanced extraction...");
        // PDF text extraction will be implemented in future version
        return "PDF processado - extração avançada de texto em desenvolvimento";
      }
      
      // Extract text from Word documents
      if (mimeType.includes("wordprocessingml") || 
          mimeType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml")) {
        console.log("Processing Word document with advanced extraction...");
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
          return "Documento Office - formato não suportado para extração automática";
        }
      }
      
      console.log("Unsupported file type for advanced text extraction:", mimeType);
      return "";
      
    } catch (error) {
      console.error("Advanced text extraction error:", error);
      throw error;
    }
  }

  private cleanOCRText(text: string): string {
    // Clean up common OCR artifacts
    return text
      .replace(/\n\s*\n/g, '\n') // Remove multiple blank lines
      .replace(/[^\w\s\.,!?;:\-()[\]{}áéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(j => j.status === 'pending').length,
      processing: this.queue.filter(j => j.status === 'processing').length,
      completed: this.queue.filter(j => j.status === 'completed').length,
      failed: this.queue.filter(j => j.status === 'failed').length,
    };
  }

  getJobStatus(jobId: string): QueueJob | undefined {
    return this.queue.find(j => j.id === jobId);
  }
}

export const ocrQueue = new OCRQueue();