

import React, { useEffect, useRef, useCallback } from "react";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";
import mermaid from "mermaid";
import { marked } from 'marked';
import { usePanZoom } from '../hooks/use-pan-zoom';
import { useMermaid } from '../hooks/use-mermaid';


// Initialize mermaid with better error handling
mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
    logLevel: 'error'
});

// Create a custom renderer to preserve math delimiters
const renderer = new marked.Renderer();

// Override the text renderer to preserve math delimiters
renderer.text = function(text) {
    // Don't escape backslashes in math delimiters
    return String(text.raw || text);
};

// Configure marked with custom renderer
marked.setOptions({
    breaks: false,
    gfm: true,
    renderer: renderer
});

interface MarkdownViewerProps {
    content: string;
    className?: string;
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [processedHtml, setProcessedHtml] = React.useState<string>("");
    const [isMounted, setIsMounted] = React.useState(false);


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

            // Replace mermaid code blocks with special divs
            const processedContent = content.replace(
                /```mermaid\n([\s\S]*?)```/g,
                (_, code) => {
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                    const sanitizedCode = sanitizeMermaidCode(code);
                    return `<div class="mermaid" id="${id}">${sanitizedCode}</div>`;
                }
            );

            // Render the markdown content using marked with custom renderer
            console.log('Processing content with marked (custom renderer):', processedContent.substring(0, 200) + '...');
            
            let renderedHtml = marked.parse(processedContent) as string;
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
    }, [content]);

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
            console.log('processMathExpressions called');
            if (containerRef.current && (window as any).MathJax) {
                console.log('MathJax v4.0.0 with CHTML output is available, processing math expressions...');
                console.log('MathJax version:', (window as any).MathJax.version);
                console.log('Container HTML sample:', containerRef.current.innerHTML.substring(0, 500));
                
                // Check what math delimiters are in the container before processing
                const containerHTML = containerRef.current.innerHTML;
                console.log('Math delimiters in container before MathJax:', {
                    hasDollarInline: containerHTML.includes('$') && !containerHTML.includes('$$'),
                    hasDollarDisplay: containerHTML.includes('$$'),
                    hasParentheses: containerHTML.includes('\\('),
                    hasBrackets: containerHTML.includes('\\[')
                });
                
                // Process the entire container - MathJax v4.0.0 will find and process all math expressions
                console.log('Calling MathJax.typesetPromise with container for CHTML output...');
                
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
