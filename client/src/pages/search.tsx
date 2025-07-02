import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Grid, List } from "lucide-react";
import { DocumentResults } from "@/components/document-results";
import { DocumentPreviewModal } from "@/components/document-preview-modal";
import type { Document } from "@shared/schema";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [department, setDepartment] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: [
      "/api/documents",
      searchQuery,
      category,
      department,
      dateFrom,
      dateTo,
      page,
      sortBy,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (category && category !== "all") params.append("category", category);
      if (department && department !== "all") params.append("department", department);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      params.append("page", page.toString());
      params.append("sortBy", sortBy);

      const response = await fetch(`/api/documents?${params}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
  });

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("all");
    setDepartment("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-gray-900 mb-2">Buscar Documentos</h2>
        <p className="text-gray-600">
          Encontre rapidamente seus documentos usando filtros avançados e busca por conteúdo.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 shadow-material">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Main Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, conteúdo, tags..."
                className="pl-10 py-3"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="contrato">Contratos</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="juridico">Jurídico</SelectItem>
                  <SelectItem value="rh">Recursos Humanos</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="operacional">Operacional</SelectItem>
                </SelectContent>
              </Select>

              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os departamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os departamentos</SelectItem>
                  <SelectItem value="administracao">Administração</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="juridico">Jurídico</SelectItem>
                  <SelectItem value="rh">RH</SelectItem>
                  <SelectItem value="ti">TI</SelectItem>
                  <SelectItem value="vendas">Vendas</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="Data inicial"
              />

              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Data final"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={handleSearch} className="bg-primary hover:bg-primary-dark">
                <Search className="mr-2" size={16} />
                Buscar
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                <X className="mr-2" size={16} />
                Limpar Filtros
              </Button>
              <div className="ml-auto flex items-center space-x-2">
                <span className="text-sm text-gray-600">Visualização:</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "text-primary bg-primary/20" : "text-gray-600"}
                >
                  <Grid size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "text-primary bg-primary/20" : "text-gray-600"}
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          {searchResults ? (
            <span>{searchResults.total} documentos encontrados</span>
          ) : (
            <span>Carregando...</span>
          )}
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevância</SelectItem>
            <SelectItem value="date-desc">Data (mais recente)</SelectItem>
            <SelectItem value="date-asc">Data (mais antiga)</SelectItem>
            <SelectItem value="title">Título (A-Z)</SelectItem>
            <SelectItem value="size">Tamanho</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <DocumentResults
        documents={searchResults?.documents || []}
        viewMode={viewMode}
        isLoading={isLoading}
        onPreview={setPreviewDocument}
        page={page}
        total={searchResults?.total || 0}
        onPageChange={setPage}
      />

      {/* Preview Modal */}
      {previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </main>
  );
}
