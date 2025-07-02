import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Eye, Download, Edit, Share2, Folder, Building, Calendar, File, ExternalLink, RefreshCw, CheckCircle, Clock } from "lucide-react";
import { getFileIcon, formatFileSize } from "@/lib/file-utils";
import { DocumentEditModal } from "@/components/document-edit-modal";
import { OCRStatusIndicator } from "@/components/ocr-status-indicator";
import type { Document } from "@shared/schema";

interface DocumentResultsProps {
  documents: Document[];
  viewMode: "list" | "grid";
  isLoading: boolean;
  onPreview: (document: Document) => void;
  page: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function DocumentResults({
  documents,
  viewMode,
  isLoading,
  onPreview,
  page,
  total,
  onPageChange,
}: DocumentResultsProps) {
  const [editDocument, setEditDocument] = useState<Document | null>(null);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(total / itemsPerPage);

  const handleDownload = async (document: Document) => {
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

  const handleOpenOriginal = (document: Document) => {
    const url = `/api/documents/${document.id}/download`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="shadow-material">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="shadow-material">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <File className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento encontrado</h3>
          <p className="text-gray-600">Tente ajustar seus filtros ou critérios de busca.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {viewMode === "list" ? (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="shadow-material hover:shadow-material-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Document Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                      {getFileIcon(doc.mimeType)}
                    </div>
                  </div>
                  
                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3
                          className="text-lg font-medium text-gray-900 hover:text-primary cursor-pointer"
                          onClick={() => onPreview(doc)}
                        >
                          {doc.title}
                        </h3>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {doc.description}
                          </p>
                        )}
                        
                        {/* Tags */}
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {doc.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onPreview(doc)}
                          className="text-gray-400 hover:text-primary"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(doc)}
                          className="text-gray-400 hover:text-green-600"
                        >
                          <Download size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditDocument(doc)}
                          className="text-gray-400 hover:text-yellow-600"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Share2 size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Folder className="mr-1" size={14} />
                        {doc.category}
                      </span>
                      {doc.department && (
                        <span className="flex items-center">
                          <Building className="mr-1" size={14} />
                          {doc.department}
                        </span>
                      )}
                      {doc.documentDate && (
                        <span className="flex items-center">
                          <Calendar className="mr-1" size={14} />
                          {new Date(doc.documentDate).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                      <span className="flex items-center">
                        <File className="mr-1" size={14} />
                        {formatFileSize(doc.fileSize)}
                      </span>
                      <OCRStatusIndicator document={doc} showReprocessButton={true} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className="shadow-material hover:shadow-material-lg transition-shadow cursor-pointer"
              onClick={() => onPreview(doc)}
            >
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3">
                    {getFileIcon(doc.mimeType)}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                    {doc.title}
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Folder className="mr-2" size={14} />
                    {doc.category}
                  </div>
                  {doc.documentDate && (
                    <div className="flex items-center">
                      <Calendar className="mr-2" size={14} />
                      {new Date(doc.documentDate).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                  <div className="flex items-center">
                    <File className="mr-2" size={14} />
                    {formatFileSize(doc.fileSize)}
                  </div>
                  <div className="flex justify-center">
                    <OCRStatusIndicator document={doc} />
                  </div>
                </div>
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(doc);
                    }}
                    className="text-gray-400 hover:text-primary"
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(doc);
                    }}
                    className="text-gray-400 hover:text-green-600"
                  >
                    <Download size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditDocument(doc);
                    }}
                    className="text-gray-400 hover:text-yellow-600"
                  >
                    <Edit size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando{" "}
            <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> a{" "}
            <span className="font-medium">
              {Math.min(page * itemsPerPage, total)}
            </span>{" "}
            de <span className="font-medium">{total}</span> resultados
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) onPageChange(page - 1);
                  }}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && page > 3) {
                  pageNum = page - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(pageNum);
                      }}
                      isActive={pageNum === page}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) onPageChange(page + 1);
                  }}
                  className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Edit Modal */}
      {editDocument && (
        <DocumentEditModal
          document={editDocument}
          onClose={() => setEditDocument(null)}
        />
      )}
    </div>
  );
}
