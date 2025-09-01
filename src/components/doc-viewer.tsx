"use client";

import { useEffect, useState } from "react";
import { MarkdownViewer } from "./markdown-viewer";
import { Button } from "./ui/button";
import { Edit } from "lucide-react";
import Link from "next/link";
import { Card } from "./ui/card";

interface DocViewerProps {
  filename: string;
}

export function DocViewer({ filename }: DocViewerProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch the document from the public directory
        const response = await fetch(`/docs/${filename}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load document: ${response.statusText}`);
        }
        
        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error("Error loading document:", err);
        setError(err instanceof Error ? err.message : "Failed to load document");
      } finally {
        setIsLoading(false);
      }
    };

    if (filename) {
      fetchDocument();
    }
  }, [filename]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading document...</div>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-destructive">
            {error || "Document not found"}
          </div>
        </div>
      </div>
    );
  }

  // Create a URL with the content as a query parameter for editing
  const editUrl = `/?content=${encodeURIComponent(content)}`;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold truncate">{filename}</h1>
        <div className="flex gap-2">
          <Link href={editUrl}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Open in Editor
            </Button>
          </Link>
        </div>
      </div>
      <Card className="flex-1 m-4 overflow-auto">
        <MarkdownViewer content={content} />
      </Card>
    </div>
  );
} 