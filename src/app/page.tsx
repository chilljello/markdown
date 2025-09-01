"use client";

import { MarkdownEditor } from "@/components/markdown-editor";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Info, Github, FileText, Split, Maximize2, Copy, Check } from "lucide-react";
import { useSearchParams } from "next/navigation";

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

function HomeContent({ viewMode, onCopy, activeTab }: { 
  viewMode: "split" | "fullscreen"; 
  onCopy: (content: string) => void;
  activeTab: "edit" | "preview";
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
  
  return (
    <div className="mx-auto container py-6 flex-1">
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
          />
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [viewMode, setViewMode] = useState<"split" | "fullscreen">("fullscreen");
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentMarkdown, setCurrentMarkdown] = useState(SAMPLE_MARKDOWN);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const handleCopy = async () => {
    try {
      if (currentMarkdown) {
        await navigator.clipboard.writeText(currentMarkdown);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleMarkdownUpdate = (content: string) => {
    setCurrentMarkdown(content);
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if not typing in an input/textarea
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'q':
          event.preventDefault();
          setViewMode("split");
          break;
        case 'w':
          event.preventDefault();
          setViewMode("fullscreen");
          break;
        case 'e':
          event.preventDefault();
          setActiveTab("edit");
          break;
        case 'p':
          event.preventDefault();
          setActiveTab("preview");
          break;
        case 'c':
          event.preventDefault();
          handleCopy();
          break;
        case 'i':
          event.preventDefault();
          // Trigger import functionality
          console.log('Import triggered via keyboard shortcut');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b sticky top-0 z-50 bg-background">
        <div className="mx-auto container flex h-16 items-center px-4">
          <div className="flex items-center gap-2 mr-4">
            <FileText className="h-6 w-6" />
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href="/docs">View Documents</a>
            </Button>
          </div>
          
          <div className="ml-auto flex gap-2">
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
            <Button
              variant="ghost"
              size="icon"
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
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5" />
              <span className="sr-only">About</span>
            </Button>
          </div>
        </div>
      </header>
      
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
        <HomeContent viewMode={viewMode} onCopy={handleMarkdownUpdate} activeTab={activeTab} />
      </Suspense>
      
      <footer className="py-6 border-t">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          A tool for rendering Markdown with Mermaid diagrams
        </div>
      </footer>
    </main>
  );
}
