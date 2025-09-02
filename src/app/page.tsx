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
  FileText,
  Split,
  Maximize2,
  Copy,
  Check,
  Share2,
  Eye,
  ExternalLink,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  getShareableUrl,
  getCompressionStats,
  decompressContent,
  isCompressedContent,
} from "@/lib/compression";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

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

  // Helper function to decode content parameter (handles both compressed and raw content)
  const decodeContentParam = (param: string | null): string => {
    if (!param) return SAMPLE_MARKDOWN;

    try {
      // Check if the content is compressed
      if (isCompressedContent(param)) {
        // Decompress the content
        const decompressed = decompressContent(param);
        console.log("Content decompressed successfully from URL parameter");
        return decompressed;
      } else {
        // Content is raw, use as-is
        console.log("Using raw content from URL parameter");
        return param;
      }
    } catch (error) {
      console.error("Error decoding content parameter:", error);
      // Fallback to sample markdown if decoding fails
      return SAMPLE_MARKDOWN;
    }
  };

  const [markdown, setMarkdown] = useState(decodeContentParam(contentParam));

  // Update markdown when contentParam changes
  useEffect(() => {
    if (contentParam) {
      const decodedContent = decodeContentParam(contentParam);
      setMarkdown(decodedContent);
      onViewModeChange("fullscreen");
      onActiveTabChange("preview");
    }
  }, [contentParam, onViewModeChange, onActiveTabChange]);

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
  const [isSharing, setIsSharing] = useState(false);
  const [lastSharedUrl, setLastSharedUrl] = useState<string | null>(null);
  const [showUrlDialog, setShowUrlDialog] = useState(false);

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
    setIsSharing(true);
    const shareableUrl = getShareableUrl(currentMarkdown);
    const stats = getCompressionStats(currentMarkdown);

    navigator.clipboard
      .writeText(shareableUrl)
      .then(() => {
        console.log("Shareable URL copied to clipboard:", shareableUrl);
        console.log("Compression stats:", stats);

        // Store the last shared URL for display
        setLastSharedUrl(shareableUrl);

        // Show success toast with compression info
        if (stats.shouldCompress) {
          toast.success(
            `URL copied! Content compressed: ${stats.originalSize} → ${stats.compressedSize} chars (${stats.compressionRatio.toFixed(1)}% reduction)`,
            {
              description:
                "Share this URL to let others view your markdown content",
              duration: 4000,
            },
          );
        } else {
          toast.success("URL copied to clipboard!", {
            description:
              "Share this URL to let others view your markdown content",
            duration: 3000,
          });
        }
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
        toast.error("Failed to copy URL to clipboard", {
          description: "Please try again or copy the URL manually",
          duration: 4000,
        });
      })
      .finally(() => {
        setIsSharing(false);
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
  }, [handleCopy, activeTab]);

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
              disabled={isSharing}
            >
              {isSharing ? (
                <svg
                  className="animate-spin h-4 w-4 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              {isSharing ? "Sharing..." : "Share"}
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

      {/* Last Shared URL Display */}
      {lastSharedUrl && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <Share2 className="h-4 w-4" />
              <span>Last shared URL:</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="max-w-md">
                <code
                  className="text-xs bg-green-100 px-2 py-1 rounded text-green-700 block truncate"
                  title={lastSharedUrl}
                >
                  {lastSharedUrl}
                </code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(lastSharedUrl);
                  toast.success("URL copied to clipboard!");
                }}
                className="h-6 px-2 py-1 text-green-600 hover:text-green-800 text-xs"
                title="Copy URL to clipboard"
              >
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUrlDialog(true)}
                className="h-6 px-2 py-1 text-green-600 hover:text-green-800 text-xs"
                title="View full URL"
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLastSharedUrl(null)}
                className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                title="Hide URL display"
              >
                ×
              </Button>
            </div>
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

      {/* URL Dialog */}
      <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Shared URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                URL to share:
              </label>
              <div className="mt-2 p-3 bg-muted rounded-md">
                <code className="text-sm break-all">{lastSharedUrl}</code>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (lastSharedUrl) {
                    navigator.clipboard.writeText(lastSharedUrl);
                    toast.success("URL copied to clipboard!");
                  }
                }}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (lastSharedUrl) {
                    window.open(lastSharedUrl, "_blank");
                  }
                }}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open URL
              </Button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
