"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownViewer } from "./markdown-viewer";
import { Upload, FileText, Eye, Save, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveMarkdownFile } from "@/actions/file-actions";
import { toast } from "sonner";

interface MarkdownEditorProps {
  initialContent?: string;
  className?: string;
  onSave?: (content: string) => void;
  activeTab?: "edit" | "preview";
  onViewModeChange?: (mode: "split" | "fullscreen") => void;
  onActiveTabChange?: (tab: "edit" | "preview") => void;
}

export function MarkdownEditor({
  initialContent = "",
  className,
  onSave,
  activeTab = "edit",
  onViewModeChange,
  onActiveTabChange,
}: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [internalActiveTab, setInternalActiveTab] = useState<string>(activeTab);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filename, setFilename] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Update internal tab when external activeTab changes
  useEffect(() => {
    setInternalActiveTab(activeTab);
  }, [activeTab]);

  // Update content when initialContent changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setContent(text);
        // Notify parent component about the content change
        if (onSave) {
          onSave(text);
        }
        // Automatically switch to fullscreen mode and preview mode when file is imported
        if (onViewModeChange) {
          onViewModeChange("fullscreen");
        }
        if (onActiveTabChange) {
          onActiveTabChange("preview");
        }
        // Show success notification
        toast.success(`File "${file.name}" imported successfully! Switched to fullscreen preview mode.`);
      }
    };
    reader.readAsText(file);
  };

  // Handle file download
  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "markdown-content.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle saving to public/docs directory
  const handleSaveToServer = async () => {
    if (!filename.trim()) {
      toast.error("Please enter a valid filename");
      return;
    }

    try {
      setIsSaving(true);
      console.log("Attempting to save file:", { filename, contentLength: content.length });
      
      const result = await saveMarkdownFile(content, filename);
      console.log("Save result:", result);
      
      if (result.success) {
        toast.success(result.message);
        setSaveDialogOpen(false);
        setFilename("");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error saving file:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      toast.error(`Failed to save file: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Markdown Editor</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Drop .md files anywhere to load</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="edit"
            value={internalActiveTab}
            onValueChange={setInternalActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Edit
                <span className="text-xs text-muted-foreground">(E)</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
                <span className="text-xs text-muted-foreground">(P)</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-4">
              <div className="scroll-y-auto h-[70vh] overflow-y-auto">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your markdown content here... or drag and drop a .md file anywhere on the window"
                  className="min-h-[400px] font-mono"
                />
              </div>
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <div className="min-h-[400px]">
                <MarkdownViewer content={content} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <label className="cursor-pointer">
                Import
                <input
                  type="file"
                  accept=".md,.markdown,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setSaveDialogOpen(true)}
            >
              <Save className="h-4 w-4" />
              Save to Server
            </Button>
          </div>
          {onSave && (
            <Button
              onClick={() => onSave(content)}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Markdown File</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filename" className="text-right">
                Filename
              </Label>
              <Input
                id="filename"
                placeholder="my-markdown-file"
                className="col-span-3"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              The file will be saved in the public/docs directory with .md extension.
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleSaveToServer} 
              disabled={isSaving || !filename.trim()}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 