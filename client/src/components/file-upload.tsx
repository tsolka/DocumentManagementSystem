import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CloudUpload, X, FileText } from "lucide-react";
import { getFileIcon, formatFileSize } from "@/lib/file-utils";

interface FileWithPreview extends File {
  preview?: string;
}

interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void;
}

export function FileUpload({ onFilesSelected }: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    onFilesSelected?.(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Selecionar Arquivos</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-gray-300 hover:border-primary hover:bg-primary/5"
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CloudUpload className="text-primary" size={32} />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? "Solte os arquivos aqui" : "Arraste arquivos aqui"}
                </p>
                <p className="text-gray-600">ou clique para selecionar</p>
              </div>
              <div className="text-sm text-gray-500">
                PDF, JPEG, PNG, DOC, DOCX, XLS, XLSX, PPT, PPTX
                <br />
                Máximo 100MB por arquivo
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Preview */}
      {files.length > 0 && (
        <Card className="shadow-material">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Arquivos Selecionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CloudUpload className="text-primary" size={24} />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Fazendo Upload...</h3>
                  <p className="text-sm text-gray-600">Processando seus arquivos</p>
                </div>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              <div className="text-sm text-gray-600">
                {uploadProgress}% concluído
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
