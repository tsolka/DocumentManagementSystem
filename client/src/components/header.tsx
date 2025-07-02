import { Link, useLocation } from "wouter";
import { FolderOpen, Upload, Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [location] = useLocation();

  const isActiveTab = (path: string) => {
    if (path === "/" && (location === "/" || location === "/upload")) return true;
    return location === path;
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo e Título */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <FolderOpen className="text-white text-sm" size={16} />
              </div>
              <h1 className="text-xl font-medium text-gray-900">DocManager</h1>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/upload">
                <Button
                  variant="ghost"
                  className={`px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-300 ${
                    isActiveTab("/") || isActiveTab("/upload")
                      ? "text-primary border-primary hover:border-primary"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Upload className="mr-2" size={16} />
                  Upload
                </Button>
              </Link>
              <Link href="/search">
                <Button
                  variant="ghost"
                  className={`px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-300 ${
                    isActiveTab("/search")
                      ? "text-primary border-primary hover:border-primary"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Search className="mr-2" size={16} />
                  Buscar
                </Button>
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                <Bell size={20} />
              </Button>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="text-gray-600" size={16} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="flex">
          <Link href="/upload" className="flex-1">
            <Button
              variant="ghost"
              className={`w-full py-3 px-4 text-sm font-medium border-r border-gray-200 ${
                isActiveTab("/") || isActiveTab("/upload")
                  ? "text-primary bg-primary/10"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Upload className="mr-2" size={16} />
              Upload
            </Button>
          </Link>
          <Link href="/search" className="flex-1">
            <Button
              variant="ghost"
              className={`w-full py-3 px-4 text-sm font-medium ${
                isActiveTab("/search")
                  ? "text-primary bg-primary/10"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Search className="mr-2" size={16} />
              Buscar
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
