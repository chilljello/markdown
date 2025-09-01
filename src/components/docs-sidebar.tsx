"use client";

import { useEffect, useState } from "react";
import { getMarkdownFiles } from "@/actions/file-actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, RefreshCw } from "lucide-react";

interface DocsSidebarProps {
  className?: string;
  onSelectDoc: (filename: string) => void;
}

export function DocsSidebar({ className, onSelectDoc }: DocsSidebarProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const markdownFiles = await getMarkdownFiles();
      setFiles(markdownFiles);
    } catch (error) {
      console.error("Error loading markdown files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFileSelect = (file: string) => {
    setSelectedFile(file);
    onSelectDoc(file);
  };

  const handleRefresh = () => {
    loadFiles();
  };

  return (
    <div className={cn("w-64 border-r h-full", className)}>
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Documents</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh} 
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>
      <ScrollArea className="h-[calc(100%-65px)]">
        <div className="p-2">
          {isLoading ? (
            <div className="flex justify-center p-4">Loading...</div>
          ) : files.length === 0 ? (
            <div className="p-4 text-sm text-center text-muted-foreground">
              No documents found
            </div>
          ) : (
            <div className="space-y-1">
              {files.map((file) => (
                <Button
                  key={file}
                  variant={selectedFile === file ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-left",
                    selectedFile === file && "font-medium"
                  )}
                  onClick={() => handleFileSelect(file)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="truncate">{file}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 