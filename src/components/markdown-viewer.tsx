

import React, { useEffect, useRef, useCallback } from "react";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";
import mermaid from "mermaid";
import { Marked, Renderer } from 'marked';
import { usePanZoom } from '../hooks/use-pan-zoom';
import { useMermaid } from '../hooks/use-mermaid';
import hljs from 'highlight.js';
import { markedHighlight } from "marked-highlight";
// Initialize mermaid with better error handling
mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
    logLevel: 'error'
});

// Configure marked with highlight extension
const marked = new Marked(
  markedHighlight({
	emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, info) {
      // Skip highlighting for mermaid diagrams - they'll be handled by our custom renderer
      if (lang === 'mermaid') {
        return code;
      }
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);

// Create a function to create the custom renderer with access to sanitizeMermaidCode
const createCustomRenderer = (sanitizeMermaidCode: (code: string) => string): any => {
    // Create a new renderer instance to get default behavior
    const renderer = new Renderer();
    
    // Override only the methods we need to customize
    renderer.text = function(text: any) {
        // Match inline LaTeX math expressions (e.g., \(...\))
        const latexRegex = /\\\([^\\]*\\\)/g;
        if (text.raw && latexRegex.test(text.raw)) {
            return String(text.raw); // Return unescaped LaTeX expressions
        }
        return String(text.text || text); // Default behavior for other text
    };
    
    // Enhanced strong/bold text renderer for filename-description format
    renderer.strong = function(text: any) {
        const textContent = String(text.text || text);
        
        // Pattern to match filename-description format: filename.md (Description)
        const filenameDescriptionRegex = /^([^()]+\.(md|txt|js|ts|py|java|cpp|c|h|css|html|json|xml|yaml|yml|sql|sh|bat|ps1))\s*\(([^)]+)\)$/;
        const match = textContent.match(filenameDescriptionRegex);
        
        if (match) {
            const [, filename, extension, description] = match;
            return `<strong class="filename-description">
                <span class="filename">${filename}</span>
                <span class="description">(${description})</span>
            </strong>`;
        }
        
        // Default strong rendering for other cases
        return `<strong>${textContent}</strong>`;
    };
    
    renderer.code = function(code: any) {
        if (code.lang === 'mermaid') {
            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
            const codeString = typeof code === 'string' ? code : code.text || String(code);
            const sanitizedCode = sanitizeMermaidCode(codeString);
            return `<div class="mermaid" id="${id}">${sanitizedCode}</div>`;
        }
        
        // Use default code rendering for other languages
        return this.constructor.prototype.code.call(this, code);
    };
    
    return renderer;
};

interface MarkdownViewerProps {
    content: string;
    className?: string;
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [processedHtml, setProcessedHtml] = React.useState<string>("");
    const [isMounted, setIsMounted] = React.useState(false);

    // Use the pan and zoom hook
    const { addPanZoomToChart } = usePanZoom({
        minScale: 0.5,
        maxScale: 10,
        zoomFactor: 0.1,
        resetOnMouseLeave: true
    });

    // Use the mermaid hook
    const { renderMermaidDiagrams, sanitizeMermaidCode } = useMermaid({
        domDelay: 100,
        panZoomDelay: 200,
        fallbackDelay: 300,
        enableLogging: true
    });

    // Create custom renderer with access to sanitizeMermaidCode
    const customRenderer = React.useMemo(() => createCustomRenderer(sanitizeMermaidCode), [sanitizeMermaidCode]);

    // Function to process markdown with marked and custom mermaid handling
    const processMarkdown = useCallback(() => {
        try {
            if (!content.trim()) {
                return "";
            }

            console.log('=== MARKED PROCESSING DEBUG ===');
            console.log('Original content sample:', content.substring(0, 200));
            console.log('Contains math delimiters:', {
                hasDollarInline: content.includes('$') && !content.includes('$$'),
                hasDollarDisplay: content.includes('$$'),
                hasParentheses: content.includes('\\('),
                hasBrackets: content.includes('\\[')
            });

            // Apply custom renderer with mermaid handling
            marked.use({ renderer: customRenderer });

            // Render the markdown content using marked with custom renderer
            console.log('Processing content with marked (custom renderer):', content.substring(0, 200) + '...');

            let renderedHtml = marked.parse(content) as string;
            console.log('Marked render completed, HTML length:', renderedHtml.length);
            console.log('Rendered HTML sample:', renderedHtml.substring(0, 500) + '...');

            // Check what happened to math delimiters after marked processing
            console.log('Math delimiters after marked:', {
                hasDollarInline: renderedHtml.includes('$') && !renderedHtml.includes('$$'),
                hasDollarDisplay: renderedHtml.includes('$$'),
                hasParentheses: renderedHtml.includes('\\('),
                hasBrackets: renderedHtml.includes('\\[')
            });

            console.log('Final HTML sample:', renderedHtml.substring(0, 500) + '...');
            return renderedHtml;
        } catch (error) {
            console.error("Error processing markdown:", error);
            return `<div class="error">Error processing markdown content: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
        }
    }, [content, customRenderer]);

    // Set mounted state when component mounts
    useEffect(() => {
        console.log('Component mounting, setting isMounted to true');
        setIsMounted(true);
        return () => {
            console.log('Component unmounting, setting isMounted to false');
            setIsMounted(false);
        };
    }, []);

    // Process markdown when content changes
    useEffect(() => {
        console.log('Markdown processing useEffect triggered:', {
            isMounted,
            contentLength: content?.length || 0,
            contentPreview: content?.substring(0, 100) + '...'
        });

        if (isMounted) {
            console.log('Processing markdown...');
            const html = processMarkdown();
            console.log('Markdown processing completed, setting processedHtml');
            setProcessedHtml(html);
        } else {
            console.log('Skipping markdown processing - component not mounted');
        }
    }, [content, processMarkdown, isMounted]);

    // Process math expressions with MathJax v4.0.0
    const processMathExpressions = useCallback(() => {
        try {
            console.log('=== MATHJAX v4.0.0 CHTML PROCESSING DEBUG ===');
            if (containerRef.current && (window as any).MathJax) {
                // Process the entire container - MathJax v4.0.0 will find and process all math expressions
                (window as any).MathJax.typesetPromise([containerRef.current]).then(() => {
                    console.log('MathJax v4.0.0 CHTML processing completed successfully');
                    // Check for processed math expressions (v4.0.0 CHTML output)
                    const mathJaxElements = containerRef.current?.querySelectorAll('.MathJax, mjx-container, mjx-math, .mjx-chtml') || [];
                    console.log(`Found ${mathJaxElements.length} MathJax v4.0.0 CHTML processed elements`);
                    // Log some examples of processed math
                    mathJaxElements.forEach((element, index) => {
                        if (index < 3) { // Log first 3 elements
                            console.log(`MathJax v4.0.0 CHTML element ${index + 1}:`, {
                                tagName: element.tagName,
                                className: element.className,
                                innerHTML: element.innerHTML.substring(0, 100) + '...'
                            });
                        }
                    });
                    // Global notification for debug page
                    if ((window as any).onMathJaxProcessingComplete) {
                        (window as any).onMathJaxProcessingComplete(mathJaxElements.length);
                    }
                }).catch((error: any) => {
                    console.error('MathJax v4.0.0 processing failed:', error);
                    console.error('Error details:', {
                        message: error.message,
                        stack: error.stack
                    });
                });
            } else if (!(window as any).MathJax) {
                console.warn('MathJax v4.0.0 with CHTML output is not available on window object');
            } else {
                console.log('Container ref not available');
            }
        } catch (error) {
            console.warn('Error processing math expressions:', error);
        }
    }, [processedHtml]);

    // Render mermaid diagrams and process math after component updates
    useEffect(() => {
        console.log('useEffect triggered with:', {
            hasProcessedHtml: !!processedHtml,
            hasContainerRef: !!containerRef.current,
            isMounted,
            processedHtmlLength: processedHtml?.length || 0
        });

        if (processedHtml && containerRef.current && isMounted) {
            console.log('Starting mermaid and math processing...');
            // Add a small delay to ensure the DOM is fully updated
            const timer = setTimeout(() => {
                console.log('Timer fired, calling renderMermaidDiagrams...');
                renderMermaidDiagrams(containerRef, isMounted, addPanZoomToChart);
                // Process math expressions after mermaid rendering
                setTimeout(() => {
                    console.log('Timer fired, calling processMathExpressions...');
                    processMathExpressions();
                }, 200);


            }, 100);

            return () => {
                console.log('Cleaning up timer...');
                clearTimeout(timer);
            };
        } else {
            console.log('Skipping mermaid and math processing due to missing conditions');
        }
    }, [processedHtml, renderMermaidDiagrams, processMathExpressions, isMounted, addPanZoomToChart]);

    return (
        <Card className={cn("overflow-auto", className)}>
            <div
                ref={(el) => {
                    console.log('Container ref callback called:', { el, hasEl: !!el });
                    containerRef.current = el;
                }}
                className="markdown-body mathjax-container"
                dangerouslySetInnerHTML={{ __html: processedHtml }}
            />
        </Card>
    );
} 
