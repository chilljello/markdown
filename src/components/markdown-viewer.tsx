"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import mermaid from "mermaid";
import DOMPurify from "dompurify";
import "github-markdown-css/github-markdown.css";

// Initialize mermaid with better error handling
mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
    logLevel: 'error'
});

interface MarkdownViewerProps {
    content: string;
    className?: string;
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [processedHtml, setProcessedHtml] = React.useState<string>("");
    const [isMounted, setIsMounted] = React.useState(false);

    // Mark component as mounted and cleanup on unmount
    useEffect(() => {
        const currentContainer = containerRef.current;
        setIsMounted(true);
        return () => {
            setIsMounted(false);
            // Cleanup any existing mermaid wrappers to prevent memory leaks
            if (currentContainer) {
                const wrappers = currentContainer.querySelectorAll('.mermaid-wrapper');
                wrappers.forEach(wrapper => {
                    if (wrapper instanceof HTMLElement) {
                        // Remove all event listeners by cloning the element
                        const newWrapper = wrapper.cloneNode(true);
                        wrapper.parentNode?.replaceChild(newWrapper, wrapper);
                    }
                });
            }
        };
    }, []);

    // Function to sanitize mermaid code blocks to prevent parsing issues
    const sanitizeMermaidCode = (code: string): string => {
        // Normalize line endings (convert CRLF to LF)
        let sanitized = code.replace(/\r\n/g, '\n');
        if (sanitized.includes('gantt')) {
            // Remove multiple consecutive newlines with a single newline
            sanitized = sanitized.replace(/\n\s*\n+/g, '\n');
        }
        return sanitized;
    };

    // Function to process markdown with custom mermaid handling
    const processMarkdown = useCallback(async () => {
        try {
            // Import marked dynamically to avoid TypeScript issues
            const { marked } = await import('marked');

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
            const html = await marked(processedContent);
            // Sanitize HTML but keep the mermaid divs
            return DOMPurify.sanitize(html);
        } catch (error) {
            console.error("Error processing markdown:", error);
            return "Error processing markdown content";
        }
    }, [content]);

    // Function to update the transform of the SVG
    const updateTransform = (svgElement: SVGElement, translate: { x: number, y: number }, scale: number) => {
        if (!isMounted || !svgElement.isConnected) return;
        svgElement.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
        svgElement.style.transformOrigin = 'center';
    };

    // Function to add pan and zoom functionality to a Mermaid chart
    const addPanZoomToChart = (svgElement: SVGElement) => {
        let isPanning = false;
        let startPoint = { x: 0, y: 0 };
        let currentTranslate = { x: 0, y: 0 };
        let currentScale = 1;
        let isHovering = false;
        
        // Create a wrapper div for the SVG if it doesn't exist
        let wrapper = svgElement.parentElement;
        if (!wrapper || !wrapper.classList.contains('mermaid-wrapper')) {
            wrapper = document.createElement('div');
            wrapper.className = 'mermaid-wrapper';
            wrapper.style.cssText = `
                position: relative;
                overflow: hidden;
                cursor: default;
                border-radius: 8px;
                transition: all 0.2s ease;
                width: 100%;
                height: auto;
                min-height: 200px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;
            
            // Check if the SVG is still in the DOM before manipulating it
            if (svgElement.parentNode && svgElement.isConnected) {
                svgElement.parentNode.insertBefore(wrapper, svgElement);
                wrapper.appendChild(svgElement);
                
                // Ensure the SVG takes full width and height of wrapper
                svgElement.style.width = '100%';
                svgElement.style.height = '100%';
                svgElement.style.margin = '0';
                svgElement.style.padding = '0';
                svgElement.style.display = 'block';
            } else {
                console.log('SVG element no longer in DOM, skipping wrapper creation');
                return;
            }

            // Only add event listeners if the component is still mounted
            if (!isMounted) {
                console.log('Component unmounted, skipping event listener setup');
                return;
            }
        }

        // Function to enable pan and zoom
        const enablePanZoom = () => {
            if (!isHovering || !isMounted) return;
            wrapper!.style.cursor = 'grab';
            wrapper!.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        };

        // Function to disable pan and zoom
        const disablePanZoom = () => {
            if (!isMounted) return;
            isPanning = false;
            wrapper!.style.cursor = 'default';
            wrapper!.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        };

        // Hover events to trigger pan and zoom functionality
        wrapper!.addEventListener('mouseenter', () => {
            if (!isMounted) return;
            isHovering = true;
            enablePanZoom();
        });

        wrapper!.addEventListener('mouseleave', () => {
            if (!isHovering || !isMounted) return;
            isHovering = false;
            disablePanZoom();
            // Reset transform when leaving
            currentTranslate = { x: 0, y: 0 };
            currentScale = 1;
            updateTransform(svgElement, currentTranslate, currentScale);
        });

        // Mouse event listeners for panning (only active when hovering)
        wrapper!.addEventListener('mousedown', (e) => {
            if (!isHovering || e.button !== 0 || !isMounted) return; // Only left mouse button and when hovering
            
            isPanning = true;
            startPoint = { x: e.clientX, y: e.clientY };
            wrapper!.style.cursor = 'grabbing';
            e.preventDefault();
        });

        wrapper!.addEventListener('mousemove', (e) => {
            if (!isHovering || !isPanning || !isMounted) return;
            
            const deltaX = e.clientX - startPoint.x;
            const deltaY = e.clientY - startPoint.y;
            
            currentTranslate.x += deltaX;
            currentTranslate.y += deltaY;
            
            startPoint = { x: e.clientX, y: e.clientY };
            
            updateTransform(svgElement, currentTranslate, currentScale);
        });

        wrapper!.addEventListener('mouseup', () => {
            if (!isHovering || !isMounted) return;
            isPanning = false;
            wrapper!.style.cursor = 'grab';
        });

        // Wheel event for zooming (only active when hovering)
        wrapper!.addEventListener('wheel', (e) => {
            if (!isHovering || !isMounted) return;
            
            e.preventDefault();
            
            const zoomFactor = 0.1;
            const delta = e.deltaY > 0 ? -zoomFactor : zoomFactor;
            
            currentScale = Math.max(0.5, Math.min(3, currentScale + delta));
            
            updateTransform(svgElement, currentTranslate, currentScale);
        });

        // Double-click to reset (only active when hovering)
        wrapper!.addEventListener('dblclick', () => {
            if (!isHovering || !isMounted) return;
            
            currentTranslate = { x: 0, y: 0 };
            currentScale = 1;
            updateTransform(svgElement, currentTranslate, currentScale);
        });
    };

    // Function to render mermaid diagrams
    const renderMermaidDiagrams = useCallback(async () => {
        // Double-check that the ref is still valid
        if (!containerRef.current || !isMounted) {
            console.log('Container ref not ready or component unmounted, skipping mermaid rendering');
            return;
        }
        
        try {
            console.log('Attempting to render mermaid diagrams...');
            
            // Wait for DOM to be fully updated
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check again after the delay
            if (!containerRef.current || !isMounted) {
                console.log('Container ref lost after delay, skipping mermaid rendering');
                return;
            }
            
            const mermaidElements = containerRef.current.querySelectorAll('.mermaid');
            console.log(`Found ${mermaidElements.length} mermaid elements`);
            
            if (mermaidElements.length === 0) return;
            
            // Log the content of each mermaid element
            mermaidElements.forEach((element, index) => {
                console.log(`Mermaid element ${index}:`, element.textContent);
            });
            
            // Render all mermaid diagrams
            try {
                await mermaid.run({
                    nodes: Array.from(mermaidElements) as HTMLElement[]
                });
                
                // Add pan and zoom functionality after rendering is complete
                // Use a small delay to ensure DOM is fully updated
                setTimeout(() => {
                    if (containerRef.current && isMounted) {
                        const renderedSvgs = containerRef.current.querySelectorAll('.mermaid svg');
                        if (renderedSvgs) {
                            renderedSvgs.forEach((svg) => {
                                if (svg instanceof SVGElement) {
                                    console.log('Adding pan and zoom to SVG:', svg);
                                    addPanZoomToChart(svg);
                                }
                            });
                        }
                    }
                }, 200);
                
            } catch (error) {
                console.error("Error in mermaid.run:", error);
                // Fallback: try to add pan and zoom to any existing SVGs
                setTimeout(() => {
                    if (containerRef.current && isMounted) {
                        const renderedSvgs = containerRef.current.querySelectorAll('.mermaid svg');
                        if (renderedSvgs) {
                            renderedSvgs.forEach((svg) => {
                                if (svg instanceof SVGElement) {
                                    addPanZoomToChart(svg);
                                }
                            });
                        }
                    }
                }, 300);
            }
            
            console.log('Mermaid diagrams rendered successfully');
            
        } catch (error) {
            console.error("Error rendering mermaid diagrams:", error);
        }
    }, [isMounted, addPanZoomToChart]);

    // Process markdown when content changes
    useEffect(() => {
        processMarkdown().then(setProcessedHtml);
    }, [content, processMarkdown]);

    // Render mermaid diagrams after component updates
    useEffect(() => {
        if (processedHtml && containerRef.current && isMounted) {
            // Add a small delay to ensure the DOM is fully updated
            const timer = setTimeout(() => {
                renderMermaidDiagrams();
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [processedHtml, renderMermaidDiagrams, isMounted]);

    return (
        <Card className={cn("p-6 overflow-auto", className)}>
            <style dangerouslySetInnerHTML={{
                __html: `
                    .mermaid {
                        display: block !important;
                        text-align: center;
                        margin: 20px 0;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        min-height: 100px;
                    }
                    .mermaid svg {
                        max-width: 100%;
                        height: auto;
                    }
                `
            }} />
            <div
                ref={containerRef}
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: processedHtml }}
            />
        </Card>
    );
} 
