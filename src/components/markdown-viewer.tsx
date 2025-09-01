"use client";

import React, { useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import mermaid from "mermaid";
import DOMPurify from "dompurify";
import "github-markdown-css/github-markdown.css";

// Initialize mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
    logLevel: 'error',
});

interface MarkdownViewerProps {
    content: string;
    className?: string;
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Function to sanitize mermaid code blocks to prevent parsing issues
    const sanitizeMermaidCode = (code: string): string => {
        // Normalize line endings (convert CRLF to LF)
        let sanitized = code.replace(/\r\n/g, '\n');
        if (sanitized.includes('gantt')) {
            // Remove multiple consecutive newlines with a single newline
            sanitized = sanitized.replace(/\n\s*\n+/g, '\n');
            console.log(sanitized);
          
        }

        return sanitized;
    };

    // Function to process markdown with custom mermaid handling
    const processMarkdown = () => {
        try {
            // Import marked dynamically to avoid TypeScript issues
            const { marked } = require('marked');

            // Replace mermaid code blocks with special divs before rendering
            const processedContent = content.replace(
                /```mermaid\n([\s\S]*?)```/g,
                (_, code) => {
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                    const sanitizedCode = sanitizeMermaidCode(code);
                    return `<div class="mermaid" id="${id}">${sanitizedCode}</div>`;
                }
            );
            // Convert markdown to HTML
            const html = marked(processedContent);
            // Sanitize HTML but keep the mermaid divs
            return DOMPurify.sanitize(html);
        } catch (error) {
            console.error("Error processing markdown:", error);
            return "Error processing markdown content";
        }
    };

    // Render mermaid diagrams after component updates
    useEffect(() => {
        if (containerRef.current) {
            try {
                // Allow time for DOM to update
                setTimeout(() => {
                    mermaid.run({
                        nodes: containerRef.current?.querySelectorAll('.mermaid') || [],
                        suppressErrors: true,
                        postRenderCallback: (svg) => {
                            console.log(svg);
                        }
                    });
                }, 100);
            } catch (error) {
                console.error("Error rendering mermaid diagrams:", error);
            }
        }
    }, [content]);

    return (
        <Card className={cn("p-6 overflow-auto", className)}>
            <div
                ref={containerRef}
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: processMarkdown() }}
            />
        </Card>
    );
} 
