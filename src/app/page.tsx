"use client";

import { MarkdownEditor } from "@/components/markdown-editor";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { useState, useEffect, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Info, Github, FileText } from "lucide-react";
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

function HomeContent() {
  const searchParams = useSearchParams();
  const contentParam = searchParams.get("content");
  
  const [markdown, setMarkdown] = useState(contentParam || SAMPLE_MARKDOWN);
  
  // Update markdown when contentParam changes
  useEffect(() => {
    if (contentParam) {
      setMarkdown(contentParam);
    }
  }, [contentParam]);
  
  return (
    <div className="mx-auto container py-6 flex-1">
      <Tabs defaultValue="fullscreen" className="w-full">
        <TabsList className="grid w-80 grid-cols-2 mb-4">
          <TabsTrigger value="edit-preview">Split View</TabsTrigger>
          <TabsTrigger value="fullscreen">Full Screen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit-preview" className="w-full">
          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-[600px] rounded-lg border"
          >
            <ResizablePanel defaultSize={50}>
              <MarkdownEditor
                initialContent={markdown}
                onSave={setMarkdown}
                className="border-0 rounded-none h-full"
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
              <div className="h-full p-6">
                <MarkdownViewer content={markdown} className="h-full w-full" />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabsContent>
        
        <TabsContent value="fullscreen" className="w-full">
          <div className="rounded-lg border">
            <MarkdownEditor
              initialContent={markdown}
              onSave={setMarkdown}
              className="border-0 rounded-none"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto container flex h-16 items-center px-4">
          <div className="flex items-center gap-2 mr-4">
            <FileText className="h-6 w-6" />
            <h1 className="text-lg font-bold">Markdown Mermaid Viewer</h1>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href="/docs">View Documents</a>
            </Button>
          </div>
          
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://github.com/mermaid-js/mermaid"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5" />
              <span className="sr-only">About</span>
            </Button>
          </div>
        </div>
      </header>
      
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
        <HomeContent />
      </Suspense>
      
      <footer className="py-6 border-t">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          Markdown Mermaid Viewer - A tool for rendering Markdown with Mermaid diagrams
        </div>
      </footer>
    </main>
  );
}
