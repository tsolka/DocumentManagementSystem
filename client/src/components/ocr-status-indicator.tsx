import { CheckCircle, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Document } from "@shared/schema";

interface OCRStatusIndicatorProps {
  document: Document;
  showReprocessButton?: boolean;
}

export function OCRStatusIndicator({ document, showReprocessButton = false }: OCRStatusIndicatorProps) {
  const queryClient = useQueryClient();

  const reprocessMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/documents/${document.id}/reprocess`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao reprocessar documento");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate document queries to refresh status
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });

  const getStatusInfo = () => {
    if (document.ocrProcessed) {
      return {
        icon: CheckCircle,
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        text: "OCR Completo",
        tooltip: "Texto extraído com sucesso"
      };
    }

    // Check if document type needs OCR
    const needsOCR = document.mimeType.startsWith("image/") || 
                     (document.mimeType === "application/pdf" && 
                      (!document.extractedText || document.extractedText.length < 100));

    if (needsOCR) {
      return {
        icon: Clock,
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        text: "Processando OCR",
        tooltip: "Extração de texto em andamento"
      };
    }

    return {
      icon: CheckCircle,
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      text: "Texto Extraído",
      tooltip: "Texto extraído sem necessidade de OCR"
    };
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={status.color}>
              <StatusIcon className="mr-1" size={12} />
              {status.text}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{status.tooltip}</p>
          </TooltipContent>
        </Tooltip>

        {showReprocessButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => reprocessMutation.mutate()}
                disabled={reprocessMutation.isPending}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${reprocessMutation.isPending ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reprocessar com OCR</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}