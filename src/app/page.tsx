"use client";

import { MarkdownEditor } from "@/components/markdown-editor";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { DragDropZone } from "@/components/drag-drop-zone";
import { useState, useEffect, Suspense, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Info,
  FileText,
  Split,
  Maximize2,
  Copy,
  Check,
  Share2,
  Eye,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { getShareableUrl, getCompressionStats } from "@/lib/compression";
import { toast } from "sonner";

// Sample markdown with Mermaid diagram for demonstration
const SAMPLE_MARKDOWN = `# Markdown Mermaid Viewer

Welcome to the Markdown Mermaid Viewer! This tool allows you to:

- Write and edit Markdown content
- Render Mermaid diagrams inside your Markdown
- Preview the rendered content in real-time
- Import and export your Markdown files

## Example Mermaid Diagram

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[Continue]
\`\`\`

## Flowchart Example

\`\`\`mermaid
flowchart LR
    A[Hard edge] -->|Link text| B(Round edge)
    B --> C{Decision}
    C -->|One| D[Result one]
    C -->|Two| E[Result two]
\`\`\`

## Sequence Diagram Example

\`\`\`mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
\`\`\`

## Class Diagram Example

\`\`\`mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        -int sizeInFeet
        -canEat()
    }
    class Zebra{
        +bool is_wild
        +run()
    }
\`\`\`

## How to Use

1. Write your Markdown in the editor
2. Include Mermaid diagrams using the \`\`\`mermaid code fence
3. Switch to the preview tab to see the rendered result
4. Import or export your work using the buttons below
`;

function HomeContent({
  viewMode,
  onCopy,
  activeTab,
  onViewModeChange,
  onActiveTabChange,
}: {
  viewMode: "split" | "fullscreen";
  onCopy: (content: string) => void;
  activeTab: "edit" | "preview";
  onViewModeChange: (mode: "split" | "fullscreen") => void;
  onActiveTabChange: (tab: "edit" | "preview") => void;
}) {
  const searchParams = useSearchParams();
  const contentParam = searchParams.get("content");

  const [markdown, setMarkdown] = useState(contentParam || SAMPLE_MARKDOWN);

  // Update markdown when contentParam changes
  useEffect(() => {
    if (contentParam) {
      setMarkdown(contentParam);
    }
  }, [contentParam]);

  // Pass the current markdown content to the copy function
  const handleSave = (content: string) => {
    setMarkdown(content);
    // Update the copy function's access to current content
    onCopy(content);
  };

  // Handle file drop from drag and drop
  const handleFileDrop = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setMarkdown(text);
        onCopy(text);
        // Automatically switch to fullscreen mode and preview mode when file is uploaded
        onViewModeChange("fullscreen");
        onActiveTabChange("preview");
        // Show success notification
        toast.success(
          `File "${file.name}" loaded successfully! Switched to fullscreen preview mode.`,
        );
      }
    };
    reader.readAsText(file);
  };

  return (
    <DragDropZone
      onFileDrop={handleFileDrop}
      className="mx-auto container py-6 flex-1"
    >
      {viewMode === "split" ? (
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[600px] rounded-lg border"
        >
          <ResizablePanel defaultSize={50}>
            <MarkdownEditor
              initialContent={markdown}
              onSave={handleSave}
              className="border-0 rounded-none h-full"
              activeTab={activeTab}
              onViewModeChange={onViewModeChange}
              onActiveTabChange={onActiveTabChange}
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            <div className="h-full p-6">
              <MarkdownViewer content={markdown} className="h-full w-full" />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="rounded-lg border">
          <MarkdownEditor
            initialContent={markdown}
            onSave={handleSave}
            className="border-0 rounded-none"
            activeTab={activeTab}
            onViewModeChange={onViewModeChange}
            onActiveTabChange={onActiveTabChange}
          />
        </div>
      )}
    </DragDropZone>
  );
}

export default function Home() {
  const [viewMode, setViewMode] = useState<"split" | "fullscreen">(
    "fullscreen",
  );
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentMarkdown, setCurrentMarkdown] = useState(SAMPLE_MARKDOWN);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isDragOver, setIsDragOver] = useState(false);
  const [showFullscreenMessage, setShowFullscreenMessage] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      if (currentMarkdown) {
        await navigator.clipboard.writeText(currentMarkdown);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }, [currentMarkdown]);

  const handleMarkdownUpdate = (content: string) => {
    setCurrentMarkdown(content);
  };

  // Generate shareable URL with gzip compression
  const handleShare = useCallback(() => {
    const shareableUrl = getShareableUrl(currentMarkdown);
    const stats = getCompressionStats(currentMarkdown);

    navigator.clipboard
      .writeText(shareableUrl)
      .then(() => {
        console.log("Shareable URL copied to clipboard:", shareableUrl);
        console.log("Compression stats:", stats);

        // You could add a toast notification here showing compression ratio
        if (stats.shouldCompress) {
          console.log(
            `Content compressed: ${stats.originalSize} → ${stats.compressedSize} chars (${stats.compressionRatio.toFixed(1)}% reduction)`,
          );
        }
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
      });
  }, [currentMarkdown]);

  // Global drag and drop handlers
  useEffect(() => {
    const handleGlobalDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        const hasFiles = Array.from(e.dataTransfer.items).some(
          (item) => item.kind === "file",
        );
        if (hasFiles) {
          setIsDragOver(true);
        }
      }
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault();
      // Only hide if we're leaving the window entirely
      if (
        e.clientX <= 0 ||
        e.clientY <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        setIsDragOver(false);
      }
    };

    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };

    // Add global event listeners
    document.addEventListener("dragenter", handleGlobalDragEnter);
    document.addEventListener("dragleave", handleGlobalDragLeave);
    document.addEventListener("dragover", handleGlobalDragOver);
    document.addEventListener("drop", handleGlobalDrop);

    return () => {
      document.removeEventListener("dragenter", handleGlobalDragEnter);
      document.removeEventListener("dragleave", handleGlobalDragLeave);
      document.removeEventListener("dragover", handleGlobalDragOver);
      document.removeEventListener("drop", handleGlobalDrop);
    };
  }, []);

  // Auto-scroll to top when switching to fullscreen preview mode
  useEffect(() => {
    if (viewMode === "fullscreen" && activeTab === "preview") {
      // Scroll to top of the page for better fullscreen experience
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Show fullscreen message briefly
      setShowFullscreenMessage(true);
      setTimeout(() => setShowFullscreenMessage(false), 2000);
    }
  }, [viewMode, activeTab]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if not typing in an input/textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "q":
          event.preventDefault();
          setViewMode("split");
          break;
        case "w":
          event.preventDefault();
          setViewMode("fullscreen");
          break;
        case "e":
          event.preventDefault();
          setActiveTab("edit");
          break;
        case "p":
          event.preventDefault();
          setActiveTab("preview");
          break;
        case "v":
          event.preventDefault();
          // Toggle between edit and preview
          setActiveTab(activeTab === "edit" ? "preview" : "edit");
          break;
        case "c":
          event.preventDefault();
          handleCopy();
          break;
        case "i":
          event.preventDefault();
          // Trigger import functionality
          console.log("Import triggered via keyboard shortcut");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCopy]);

  return (
    <main
      className={cn(
        "flex min-h-screen flex-col transition-all duration-300 ease-in-out",
        viewMode === "fullscreen" &&
          activeTab === "preview" &&
          "bg-gradient-to-br from-background to-muted/20",
      )}
    >
      <header
        className={cn(
          "border-b sticky top-0 z-50 bg-background transition-all duration-300 ease-in-out",
          isDragOver && "bg-primary/5 border-primary/50",
          viewMode === "fullscreen" &&
            activeTab === "preview" &&
            "bg-background/95 backdrop-blur-sm border-primary/20",
        )}
      >
        <div className="mx-auto container flex h-16 items-center px-4">
          <div className="flex items-center gap-2 mr-4">
            <FileText
              className={cn(
                "h-6 w-6 transition-colors duration-200",
                isDragOver && "text-primary",
              )}
            />
          </div>

          <div className="flex gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href="/docs">View Documents</a>
            </Button>
          </div>

          <div className="ml-auto flex gap-2">
            {isDragOver && (
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium">
                <FileText className="h-4 w-4" />
                Drop markdown file here
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-2"
            >
              {copySuccess ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
              <span className="sr-only">Copy markdown content</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant={viewMode === "split" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("split")}
              className="flex items-center gap-2"
            >
              <Split className="h-4 w-4" />
              Split View
              <span className="text-xs text-muted-foreground ml-1">(Q)</span>
            </Button>
            <Button
              variant={viewMode === "fullscreen" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("fullscreen")}
              className="flex items-center gap-2"
            >
              <Maximize2 className="h-4 w-4" />
              Full Screen
              <span className="text-xs text-muted-foreground ml-1">(W)</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Fullscreen Preview Mode Message */}
      {showFullscreenMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <span className="font-medium">
              Switched to Fullscreen Preview Mode
            </span>
          </div>
        </div>
      )}

      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <HomeContent
          viewMode={viewMode}
          onCopy={handleMarkdownUpdate}
          activeTab={activeTab}
          onViewModeChange={setViewMode}
          onActiveTabChange={setActiveTab}
        />
      </Suspense>

      {!(viewMode === "fullscreen" && activeTab === "preview") && (
        <footer className="py-6 border-t">
          <div className="container px-4 text-center text-sm text-muted-foreground">
            A tool for rendering Markdown with Mermaid diagrams
          </div>
        </footer>
      )}
    </main>
  );
}
