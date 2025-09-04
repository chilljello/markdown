

import React, { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";
import DOMPurify from "dompurify";
import "github-markdown-css/github-markdown.css";
import { MathpixMarkdownModel as MM } from 'mathpix-markdown-it';

interface SimpleLatexViewerProps {
  content: string;
  className?: string;
}

export function SimpleLatexViewer({ content, className }: SimpleLatexViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [processedHtml, setProcessedHtml] = useState<string>("");

  // Add mathpix styles to document head
  useEffect(() => {
    // Add mathpix styles to document head if not already present
    const elStyle = document.getElementById('Mathpix-styles');
    if (!elStyle) {
      const style = document.createElement("style");
      style.setAttribute("id", "Mathpix-styles");
      style.innerHTML = MM.getMathpixFontsStyle() + MM.getMathpixStyle(true);
      document.head.appendChild(style);
    }
  }, []);

  // Function to process markdown with mathpix-markdown-it
  const processMarkdown = React.useCallback(async () => {
    try {
      // Configure mathpix-markdown-it options for enhanced math rendering
      const options = {
        outMath: {
          include_mathml: true,
          include_asciimath: true,
          include_latex: true,
          include_svg: true,
          include_tsv: true,
          include_table_html: true,
        },
        htmlSanitize: {
          allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
            'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'abbr', 'code', 'hr', 'br', 'div',
            'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'u', 'span', 'math'],
          allowedAttributes: {
            a: ['href', 'name', 'target'],
            img: ['src', 'alt', 'title', 'width', 'height'],
            span: ['class', 'style'],
            div: ['class', 'id', 'style'],
            math: ['xmlns'],
            mjx: ['class', 'jax', 'display', 'style']
          },
          allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'data'],
          allowProtocolRelative: true
        },
        codeHighlight: {
          auto: true,
          code: true
        },
        enable_markdown: true,
        enable_latex: true,
        enable_markdown_mmd_extensions: true,
        accessibility: {
          assistiveMml: true
        }
      };

      // Convert markdown to HTML using mathpix-markdown-it
      const html = MM.markdownToHTML(content, options);
      
      // Sanitize HTML but keep the math elements
      const sanitizedHtml = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
          'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'abbr', 'code', 'hr', 'br', 'div',
          'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'u', 'span', 'math',
          'mjx-container', 'mjx-math', 'mjx-mscript', 'mjx-mo', 'mjx-mi', 'mjx-mn', 'mjx-mfrac',
          'mjx-msqrt', 'mjx-msup', 'mjx-msub', 'mjx-mrow', 'mjx-mtext', 'mjx-mspace'],
        ALLOWED_ATTR: ['href', 'name', 'target', 'src', 'alt', 'title', 'width', 'height', 'class', 'style', 'id', 'xmlns', 'jax', 'display'],
        ALLOW_DATA_ATTR: false
      });
      
      return sanitizedHtml;
    } catch (error) {
      console.error("Error processing markdown:", error);
      return "Error processing markdown content";
    }
  }, [content]);

  // Process markdown when content changes
  useEffect(() => {
    processMarkdown().then(setProcessedHtml);
  }, [content, processMarkdown]);

  return (
    <Card className={cn("p-6 overflow-auto", className)}>
      <div
        ref={containerRef}
        className="markdown-body mathpix-markdown prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    </Card>
  );
}
