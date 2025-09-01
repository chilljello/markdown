"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

export async function saveMarkdownFile(content: string, filename: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Server action: Starting save operation", { filename, contentLength: content.length });
    
    // Ensure the file has a .md extension
    if (!filename.endsWith(".md")) {
      filename = `${filename}.md`;
    }

    const docsDir = path.join(process.cwd(), "public", "docs");
    console.log("Server action: Docs directory path:", docsDir);
    
    // Create the docs directory if it doesn't exist
    if (!fs.existsSync(docsDir)) {
      console.log("Server action: Creating docs directory");
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    const filePath = path.join(docsDir, filename);
    console.log("Server action: Full file path:", filePath);
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log("Server action: File already exists");
      return { 
        success: false, 
        message: `File ${filename} already exists. Please choose a different name.` 
      };
    }
    
    // Write the file
    console.log("Server action: Writing file to disk");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Server action: File written successfully");
    
    // Revalidate cache for the docs path
    console.log("Server action: Revalidating cache");
    revalidatePath("/docs");
    
    return { 
      success: true, 
      message: `File successfully saved as ${filename}` 
    };
  } catch (error) {
    console.error("Server action: Error saving markdown file:", error);
    console.error("Server action: Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
      cwd: process.cwd(),
      docsDir: path.join(process.cwd(), "public", "docs")
    });
    return { 
      success: false, 
      message: `Error saving file: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

export async function getMarkdownFiles(): Promise<string[]> {
  try {
    const docsDir = path.join(process.cwd(), "public", "docs");
    
    // Create the docs directory if it doesn't exist
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
      return [];
    }
    
    // Get all markdown files
    const files = fs.readdirSync(docsDir)
      .filter(file => file.endsWith(".md"));
    
    return files;
  } catch (error) {
    console.error("Error getting markdown files:", error);
    return [];
  }
} 