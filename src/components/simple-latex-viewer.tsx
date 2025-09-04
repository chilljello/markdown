"use client";

import React, { useEffect, useRef, useCallback } from "react";
import mermaid from "mermaid";

// Initialize mermaid with better error handling
mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
    logLevel: 'error'
});

interface SimpleLatexViewerProps {
    content: string;
}

export function SimpleLatexViewer({ content }: SimpleLatexViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = React.useState(false);
    const [processedHtml, setProcessedHtml] = React.useState<string>("");

    // Mark component as mounted and cleanup on unmount
    useEffect(() => {
        setIsMounted(true);
        
        return () => {
            setIsMounted(false);
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

    // Function to render mermaid diagrams
    const renderMermaidDiagrams = useCallback(async () => {
        if (!containerRef.current || !isMounted) {
            return;
        }
        
        try {
            // Wait for DOM to be fully updated
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (!containerRef.current || !isMounted) {
                return;
            }
            
            const mermaidElements = containerRef.current.querySelectorAll('.mermaid');
            
            if (mermaidElements.length === 0) return;
            
            // Render all mermaid diagrams
            try {
                await mermaid.run({
                    nodes: Array.from(mermaidElements) as HTMLElement[]
                });
                
                console.log('Mermaid diagrams rendered successfully');
                
            } catch (error) {
                console.error("Error in mermaid.run:", error);
            }
            
        } catch (error) {
            console.error("Error rendering mermaid diagrams:", error);
        }
    }, [isMounted]);

    // Process content when it changes
    useEffect(() => {
        // Simple LaTeX processing
        let processedContent = content;
        
        // Convert basic Greek letters (lowercase)
        processedContent = processedContent
            .replace(/\\alpha/g, 'α')
            .replace(/\\beta/g, 'β')
            .replace(/\\gamma/g, 'γ')
            .replace(/\\delta/g, 'δ')
            .replace(/\\epsilon/g, 'ε')
            .replace(/\\zeta/g, 'ζ')
            .replace(/\\eta/g, 'η')
            .replace(/\\theta/g, 'θ')
            .replace(/\\iota/g, 'ι')
            .replace(/\\kappa/g, 'κ')
            .replace(/\\lambda/g, 'λ')
            .replace(/\\mu/g, 'μ')
            .replace(/\\nu/g, 'ν')
            .replace(/\\xi/g, 'ξ')
            .replace(/\\pi/g, 'π')
            .replace(/\\rho/g, 'ρ')
            .replace(/\\sigma/g, 'σ')
            .replace(/\\tau/g, 'τ')
            .replace(/\\upsilon/g, 'υ')
            .replace(/\\phi/g, 'φ')
            .replace(/\\chi/g, 'χ')
            .replace(/\\psi/g, 'ψ')
            .replace(/\\omega/g, 'ω');
        
        // Convert uppercase Greek letters
        processedContent = processedContent
            .replace(/\\Alpha/g, 'Α')
            .replace(/\\Beta/g, 'Β')
            .replace(/\\Gamma/g, 'Γ')
            .replace(/\\Delta/g, 'Δ')
            .replace(/\\Theta/g, 'Θ')
            .replace(/\\Lambda/g, 'Λ')
            .replace(/\\Xi/g, 'Ξ')
            .replace(/\\Pi/g, 'Π')
            .replace(/\\Sigma/g, 'Σ')
            .replace(/\\Phi/g, 'Φ')
            .replace(/\\Psi/g, 'Ψ')
            .replace(/\\Omega/g, 'Ω');
        
        // Convert common math operators
        processedContent = processedContent
            .replace(/\\cdot/g, '·')
            .replace(/\\times/g, '×')
            .replace(/\\div/g, '÷')
            .replace(/\\pm/g, '±')
            .replace(/\\mp/g, '∓')
            .replace(/\\leq/g, '≤')
            .replace(/\\geq/g, '≥')
            .replace(/\\neq/g, '≠')
            .replace(/\\approx/g, '≈')
            .replace(/\\equiv/g, '≡')
            .replace(/\\propto/g, '∝')
            .replace(/\\infty/g, '∞')
            .replace(/\\partial/g, '∂')
            .replace(/\\nabla/g, '∇')
            .replace(/\\sum/g, '∑')
            .replace(/\\prod/g, '∏')
            .replace(/\\int/g, '∫')
            .replace(/\\oint/g, '∮')
            .replace(/\\sqrt/g, '√');
        
        // Process inline math: \( ... \) -> <span class="math-inline">...</span>
        processedContent = processedContent.replace(/\\\(([^)]*)\\\)/g, '<span class="math-inline">$1</span>');
        
        // Process display math: \[ ... \] -> <div class="math-display">...</div>
        processedContent = processedContent.replace(/\\\[([^\]]*)\\\]/g, '<div class="math-display">$1</div>');
        
        // Process any remaining inline math patterns that might have been missed
        processedContent = processedContent.replace(/\\\(([^)]*)\\\)/g, '<span class="math-inline">$1</span>');
        
        // Process matrix commands
        processedContent = processedContent
            .replace(/\\begin\{pmatrix\}/g, '[')
            .replace(/\\end\{pmatrix\}/g, ']')
            .replace(/\\\\/g, '<br>');
        
        // Process additional math commands
        processedContent = processedContent
            .replace(/\\iint_([^ ]*)/g, '∬_$1')
            .replace(/\\iiint_([^ ]*)/g, '∭_$1')
            .replace(/\\oint_([^ ]*)/g, '∮_$1');
        
        // Process fractions: \frac{a}{b} -> a/b (simpler approach)
        processedContent = processedContent.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2');
        
        // Process square roots: \sqrt{x} -> √x
        processedContent = processedContent.replace(/\\sqrt\{([^}]*)\}/g, '√$1');
        
        // Process nth roots: \sqrt[n]{x} -> n√x
        processedContent = processedContent.replace(/\\sqrt\[([^\]]*)\]\{([^}]*)\}/g, '$1√$2');
        
        // Process any remaining LaTeX commands by removing the backslash
        processedContent = processedContent.replace(/\\([a-zA-Z]+)/g, '$1');
        
        // Final cleanup: convert remaining LaTeX commands to readable text
        processedContent = processedContent
            .replace(/frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
            .replace(/vec\{([^}]*)\}/g, '$1')
            .replace(/hat\{([^}]*)\}/g, '$1')
            .replace(/hbar/g, 'ℏ')
            .replace(/partial/g, '∂')
            .replace(/begin\{([^}]*)\}/g, '$1')
            .replace(/end\{([^}]*)\}/g, '')
            .replace(/\{([^}]*)\}/g, '$1') // Remove any remaining braces
            .replace(/\\\(/g, '<span class="math-inline">') // Convert any remaining \( to <span>
            .replace(/\\\)/g, '</span>'); // Convert any remaining \) to </span>
        
        // Replace mermaid code blocks with special divs before rendering
        const mermaidPlaceholders: { [key: string]: string } = {};
        processedContent = processedContent.replace(
            /```mermaid\n([\s\S]*?)```/g,
            (_, code) => {
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const sanitizedCode = sanitizeMermaidCode(code);
                const placeholder = `MERMAID_PLACEHOLDER_${id}`;
                mermaidPlaceholders[placeholder] = `<div class="mermaid" id="${id}">${sanitizedCode}</div>`;
                return placeholder;
            }
        );
        
        // Basic markdown processing
        let html = processedContent
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^\- (.*$)/gim, '<li>$1</li>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(?!<[h|li|div|span])(.*$)/gim, '<p>$1</p>')
            .replace(/<p><\/p>/g, '');
        
        // Restore mermaid placeholders
        Object.keys(mermaidPlaceholders).forEach(placeholder => {
            html = html.replace(placeholder, mermaidPlaceholders[placeholder]);
        });
        
        setProcessedHtml(html);
    }, [content]);

    // Render mermaid diagrams after HTML is updated
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
        <div className="p-6 border rounded-lg">
            <div 
                ref={containerRef}
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: processedHtml }}
            />
        </div>
    );
}
