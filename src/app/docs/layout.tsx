"use client";

import { useState } from "react";
import { DocsSidebar } from "@/components/docs-sidebar";
import { DocViewer } from "@/components/doc-viewer";
import { Button } from "@/components/ui/button";
import { PlusCircle, Home } from "lucide-react";
import Link from "next/link";

export default function DocsLayout() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="flex items-center gap-2 mr-4">
            <h1 className="text-lg font-bold">Document Viewer</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
          <div className="ml-auto">
            <Link href="/">
              <Button size="sm" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Create New Document
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <DocsSidebar onSelectDoc={setSelectedDoc} />
        <main className="flex-1 overflow-auto">
          {selectedDoc ? (
            <DocViewer filename={selectedDoc} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center max-w-md p-6">
                <h2 className="text-xl font-semibold mb-2">Select a Document</h2>
                <p className="text-muted-foreground mb-6">
                  Choose a document from the sidebar to view its content.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 