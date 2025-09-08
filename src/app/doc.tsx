'use client';

import React, { useState, useEffect } from 'react';
import { useFileManager } from '@/hooks/use-file-manager';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  FileText,
  Plus,
  Search,
  Tag,
  Download,
  Upload,
  Trash2,
  Edit3,
  Copy,
  Calendar,
  HardDrive,
  AlertTriangle,
  Clock,
  FolderOpen,
  Settings,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { DragDropZone } from '@/components/drag-drop-zone';
import { getShareableUrl } from '@/lib/compression';
import { getDecompressedContent } from '@/actions/file-actions';
import type { FileMetadata } from '@/actions/file-actions';
import { ThemeToggle } from '@/components/theme-toggle';
// MathJaxProvider removed - using Mathpix for LaTeX rendering

interface DocPageProps {
  onNavigate?: (route: 'home' | 'doc', content?: string, fileMetadata?: FileMetadata) => void;
}

export default function DocPage({ onNavigate }: DocPageProps) {
  const {
    files,
    currentFile,
    isLoading,
    error,
    stats,
    tags,
    createFile,
    updateFile,
    saveFile,
    deleteFile,
    renameFile,
    duplicateFile,
    selectFile,
    searchFiles,
    exportAllFiles,
    importFiles,
    clearAllFiles,
    checkStorage
  } = useFileManager({
    autoSave: true,
    autoSaveDelay: 3000,
    maxFiles: 100
  });

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [newFileTags, setNewFileTags] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [importData, setImportData] = useState('');
  const [selectedFileForAction, setSelectedFileForAction] = useState<string | null>(null);

  // Filtered files based on search
  const filteredFiles = searchQuery ? searchFiles(searchQuery) : files;


  // Handle create file
  const handleCreateFile = async () => {
    if (!newFileName.trim()) {
      toast.error('Please enter a file name');
      return;
    }

    try {
      const tags = newFileTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await createFile(newFileName, newFileContent, tags);
      setShowCreateDialog(false);
      setNewFileName('');
      setNewFileContent('');
      setNewFileTags('');
      toast.success(`File "${newFileName}" created successfully`);
    } catch (error) {
      console.error('Failed to create file:', error);
      toast.error('Failed to create file');
    }
  };

  // Handle rename file
  const handleRenameFile = async () => {
    if (!selectedFileForAction || !renameValue.trim()) {
      toast.error('Please enter a new name');
      return;
    }

    try {
      await renameFile(selectedFileForAction, renameValue);
      setShowRenameDialog(false);
      setRenameValue('');
      setSelectedFileForAction(null);
      toast.success('File renamed successfully');
    } catch (error) {
      console.error('Failed to rename file:', error);
      toast.error('Failed to rename file');
    }
  };

  // Handle delete file
  const handleDeleteFile = async () => {
    if (!selectedFileForAction) return;

    try {
      await deleteFile(selectedFileForAction);
      setShowDeleteDialog(false);
      setSelectedFileForAction(null);
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    }
  };

  // Handle duplicate file
  const handleDuplicateFile = async (id: string) => {
    try {
      await duplicateFile(id);
      toast.success('File duplicated successfully');
    } catch (error) {
      console.error('Failed to duplicate file:', error);
      toast.error('Failed to duplicate file');
    }
  };

  // Handle export files
  const handleExportFiles = () => {
    try {
      const exportData = exportAllFiles();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `markdown-files-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Files exported successfully');
    } catch (error) {
      console.error('Failed to export files:', error);
      toast.error('Failed to export files');
    }
  };

  // Handle import files
  const handleImportFiles = async () => {
    if (!importData.trim()) {
      toast.error('Please enter import data');
      return;
    }

    try {
      const result = await importFiles(importData);
      setShowImportDialog(false);
      setImportData('');
      toast.success(`Imported ${result.success} files successfully`);
    } catch (error) {
      console.error('Failed to import files:', error);
      toast.error('Failed to import files');
    }
  };

  // Handle clear all files
  const handleClearAllFiles = async () => {
    try {
      await clearAllFiles();
      setShowClearDialog(false);
      toast.success('All files cleared successfully');
    } catch (error) {
      console.error('Failed to clear files:', error);
      toast.error('Failed to clear files');
    }
  };

  // Handle file drop for creating new documents
  const handleFileDrop = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        if (content) {
          // Extract filename without extension for the document name
          const fileName = file.name.replace(/\.[^/.]+$/, "");
          
          // Create new document from dropped file
          await createFile(fileName, content, []);
          toast.success(`Document "${fileName}" created from file "${file.name}"`);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Failed to process dropped file:', error);
      toast.error('Failed to create document from dropped file');
    }
  };


  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Check storage status
  const storageStatus = checkStorage();


  return (
      <Layout>
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Drawer</h1>
                <p className="text-sm text-muted-foreground">Manage and edit your markdown documents</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={() => onNavigate?.('home')}>
                <FileText className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <DragDropZone onFileDrop={handleFileDrop} className="min-h-[600px]">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Documents</p>
                      <p className="text-2xl font-bold">{stats.totalFiles}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Size</p>
                      <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Modified</p>
                      <p className="text-2xl font-bold">
                        {stats.lastModified ? formatDate(stats.lastModified) : 'Never'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tags</p>
                      <p className="text-2xl font-bold">{tags.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documents by name, content, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Document
                    </Button>
                    <Button variant="outline" onClick={handleExportFiles}>
                      <Download className="h-4 w-4 mr-2" />
                      Export All
                    </Button>
                    <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle>Documents ({filteredFiles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {searchQuery ? (
                      <>
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No documents found</p>
                        <p>Try adjusting your search terms or create a new document.</p>
                      </>
                    ) : (
                      <>
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No documents yet</p>
                        <p className="mb-4">Create your first document to get started!</p>
                        <Button onClick={() => setShowCreateDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Document
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {filteredFiles.map((file) => (
                        <div
                          key={file.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            currentFile?.id === file.id
                              ? 'border-primary bg-primary/5 shadow-md'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                          onClick={() => {
                            selectFile(file.id);
                            // Navigate to home page with document content and file metadata
                            const content = file.isCompressed 
                              ? getDecompressedContent(file)
                              : file.content;
                            onNavigate?.('home', content, file);
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg truncate">{file.name}</h3>
                                {file.isCompressed && (
                                  <Badge variant="outline" className="text-xs">
                                    Compressed
                                  </Badge>
                                )}
                                {file.tags && file.tags.length > 0 && (
                                  <div className="flex gap-1">
                                    {file.tags.slice(0, 3).map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {file.tags.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{file.tags.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <span className="flex items-center gap-1">
                                  <HardDrive className="h-3 w-3" />
                                  {formatFileSize(file.size)}
                                  {file.compressedSize && (
                                    <span className="text-xs">
                                      ({formatFileSize(file.compressedSize)} compressed)
                                    </span>
                                  )}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Created: {formatDate(file.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Modified: {formatDate(file.updatedAt)}
                                </span>
                              </div>
                              {file.content && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {file.isCompressed 
                                    ? getDecompressedContent(file).substring(0, 150)
                                    : file.content.substring(0, 150)
                                  }
                                  {(file.isCompressed 
                                    ? getDecompressedContent(file).length 
                                    : file.content.length) > 150 && '...'}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateFile(file.id);
                                }}
                                title="Duplicate"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenameValue(file.name);
                                  setSelectedFileForAction(file.id);
                                  setShowRenameDialog(true);
                                }}
                                title="Rename"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFileForAction(file.id);
                                  setShowDeleteDialog(true);
                                }}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </DragDropZone>

        {/* Error display */}
        {error && (
          <Card className="border-destructive mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Storage status */}
        {!storageStatus.available && (
          <Card className="border-destructive mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Storage Error: {storageStatus.error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Create Document Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Document Name</label>
              <Input
                placeholder="Enter document name..."
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <textarea
                placeholder="Enter document content (markdown supported)..."
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                rows={12}
                className="w-full p-3 border rounded-md font-mono text-sm resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                placeholder="work, notes, ideas..."
                value={newFileTags}
                onChange={(e) => setNewFileTags(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateFile}>Create Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Document Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Name</label>
              <Input
                placeholder="Enter new document name..."
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleRenameFile}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Document Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFile} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Documents Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Import Documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">JSON Data</label>
              <textarea
                placeholder="Paste exported JSON data here..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={12}
                className="w-full p-3 border rounded-md font-mono text-sm resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleImportFiles}>Import Documents</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Documents Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Documents</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all documents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAllFiles} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <h4 className="font-medium mb-2">Storage Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={storageStatus.available ? 'text-green-600' : 'text-red-600'}>
                    {storageStatus.available ? 'Available' : 'Error'}
                  </span>
                </div>
                {storageStatus.estimatedSpace && (
                  <div className="flex justify-between">
                    <span>Estimated Space:</span>
                    <span>{formatFileSize(storageStatus.estimatedSpace)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Total Files:</span>
                  <span>{stats.totalFiles}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Size:</span>
                  <span>{formatFileSize(stats.totalSize)}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
