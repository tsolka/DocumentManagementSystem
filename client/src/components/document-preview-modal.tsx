import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Calendar, Folder, Building, File } from "lucide-react";
import { getFileIcon, formatFileSize } from "@/lib/file-utils";
import type { Document } from "@shared/schema";

interface DocumentPreviewModalProps {
  document: Document;
  onClose: () => void;
}

export function DocumentPreviewModal({ document, onClose }: DocumentPreviewModalProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/documents/${document.id}/download`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Download failed: ${response.status} ${errorText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = document.originalName;
      a.style.display = "none";
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert(`Erro no download: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleOpenOriginal = () => {
    const url = `/api/documents/${document.id}/download`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                {getFileIcon(document.mimeType)}
              </div>
              <div>
                <DialogTitle className="text-lg font-medium text-gray-900">
                  {document.title}
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">{document.originalName}</p>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Document Info Sidebar */}
          <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Description */}
              {document.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Descrição</h4>
                  <p className="text-sm text-gray-600">{document.description}</p>
                </div>
              )}

              {/* Subject */}
              {document.subject && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Assunto</h4>
                  <p className="text-sm text-gray-600">{document.subject}</p>
                </div>
              )}

              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Metadados</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Folder className="mr-2" size={14} />
                    <span className="font-medium mr-2">Categoria:</span>
                    <span>{document.category}</span>
                  </div>
                  
                  {document.department && (
                    <div className="flex items-center text-gray-600">
                      <Building className="mr-2" size={14} />
                      <span className="font-medium mr-2">Departamento:</span>
                      <span>{document.department}</span>
                    </div>
                  )}
                  
                  {document.documentDate && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="mr-2" size={14} />
                      <span className="font-medium mr-2">Data:</span>
                      <span>{new Date(document.documentDate).toLocaleDateString("pt-BR")}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-600">
                    <File className="mr-2" size={14} />
                    <span className="font-medium mr-2">Tamanho:</span>
                    <span>{formatFileSize(document.fileSize)}</span>
                  </div>
                </div>
              </div>

              {/* Extracted Text Preview */}
              {document.extractedText && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Texto Extraído</h4>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <p className="text-sm text-gray-600 line-clamp-6">
                      {document.extractedText}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Document Preview */}
          <div className="flex-1 p-6">
            <div className="bg-gray-100 rounded-lg h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {getFileIcon(document.mimeType)}
                </div>
                <p className="text-lg font-medium mb-2">Preview do Documento</p>
                <p className="text-sm mb-4">
                  Preview completo será implementado com PDF.js ou similar
                </p>
                <Button onClick={handleDownload} className="bg-primary hover:bg-primary-dark">
                  <Download className="mr-2" size={16} />
                  Baixar Documento
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2" size={16} />
            Download
          </Button>
          <Button onClick={handleOpenOriginal} className="bg-primary hover:bg-primary-dark">
            <ExternalLink className="mr-2" size={16} />
            Abrir Original
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
