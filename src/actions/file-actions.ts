"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

export async function saveMarkdownFile(content: string, filename: string): Promise<{ success: boolean; message: string }> {
  try {
    // Ensure the file has a .md extension
    if (!filename.endsWith(".md")) {
      filename = `${filename}.md`;
    }

    const docsDir = path.join(process.cwd(), "public", "docs");
    
    // Create the docs directory if it doesn't exist
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    const filePath = path.join(docsDir, filename);
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return { 
        success: false, 
        message: `File ${filename} already exists. Please choose a different name.` 
      };
    }
    
    // Write the file
    fs.writeFileSync(filePath, content);
    
    // Revalidate cache for the docs path
    revalidatePath("/docs");
    
    return { 
      success: true, 
      message: `File successfully saved as ${filename}` 
    };
  } catch (error) {
    console.error("Error saving markdown file:", error);
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