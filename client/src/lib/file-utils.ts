import { FileText, Image, FileSpreadsheet, FileType, File } from "lucide-react";
import { createElement } from "react";

export function getFileIcon(mimeType: string) {
  const iconProps = { size: 24 };
  
  if (mimeType.includes("pdf")) {
    return createElement(FileText, { ...iconProps, className: "text-red-600" });
  }
  
  if (mimeType.includes("word")) {
    return createElement(FileText, { ...iconProps, className: "text-blue-600" });
  }
  
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) {
    return createElement(FileSpreadsheet, { ...iconProps, className: "text-green-600" });
  }
  
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) {
    return createElement(FileType, { ...iconProps, className: "text-orange-600" });
  }
  
  if (mimeType.includes("image")) {
    return createElement(Image, { ...iconProps, className: "text-purple-600" });
  }
  
  return createElement(File, { ...iconProps, className: "text-gray-600" });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    contrato: "blue",
    financeiro: "green",
    juridico: "red",
    rh: "purple",
    marketing: "orange",
    operacional: "gray",
  };
  
  return colors[category] || "gray";
}

export function getDepartmentColor(department: string): string {
  const colors: Record<string, string> = {
    administracao: "blue",
    financeiro: "green",
    juridico: "red",
    rh: "purple",
    ti: "indigo",
    vendas: "yellow",
  };
  
  return colors[department] || "gray";
}
