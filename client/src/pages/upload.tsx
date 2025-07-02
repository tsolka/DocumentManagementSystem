import { FileUpload } from "@/components/file-upload";
import { MetadataForm } from "@/components/metadata-form";

export default function UploadPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-gray-900 mb-2">Upload de Documentos</h2>
        <p className="text-gray-600">
          Faça upload de seus documentos e cadastre os metadados para facilitar a busca futura.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FileUpload />
        <MetadataForm />
      </div>
    </main>
  );
}
