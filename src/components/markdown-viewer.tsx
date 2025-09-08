

import React, { useEffect, useRef, useCallback } from "react";
import { Card } from "./ui/card";
import { cn, replaceForLatext } from "../lib/utils";
import mermaid from "mermaid";
import { Marked, Renderer, type Tokens } from 'marked';
import { usePanZoom } from '../hooks/use-pan-zoom';
import { useMermaid } from '../hooks/use-mermaid';
import hljs from 'highlight.js';
import { markedHighlight } from "marked-highlight";
import markedKatex, { type MarkedKatexOptions } from "marked-katex-extension";


// Initialize mermaid with better error handling
mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
    logLevel: 'error'
});
const options: MarkedKatexOptions = {
    throwOnError: true,
    output: "mathml",
    displayMode: true,
    minRuleThickness: 0.2,
    maxExpand: 900,
    maxSize: 100000,
    nonStandard: true, // Allow non-standard LaTeX commands
};
// Create a function to create marked instance with custom renderer
const createMarkedInstance = (customRenderer: any) => {
    const instance = new Marked(
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
        }),
        {
            renderer: customRenderer,
            // Ensure inline parsing is enabled
            breaks: true,
            gfm: true,
            // Force inline parsing for list items
            pedantic: false
        }
    );
    instance.use(markedKatex(options));
    //instance.use(extendedLatex());
    return instance;
};

// Create a function to create the custom renderer with access to sanitizeMermaidCode
const createCustomRenderer = (sanitizeMermaidCode: (code: string) => string): any => {
    // Create a new renderer instance to get default behavior
    const renderer = new Renderer();

    // Create a marked instance for inline parsing within list items
    const inlineMarked = new Marked({
        breaks: true,
        gfm: true,
        pedantic: false
    });
    inlineMarked.use(markedKatex(options));


    renderer.paragraph = function (text: Tokens.Paragraph): string {
        const textContent = String(text.raw || text);
        const level_exp = replaceForLatext(textContent);
        const result = inlineMarked.parseInline(level_exp);
        return `<p class="custom-paragraph">${result}</p>`;
    }

    // Override only the methods we need to customize - normally this is thje title
    renderer.text = function (text: Tokens.Text | Tokens.Escape) {
        const textContent = String(text.text || text);
        let processedText = textContent;
        return processedText; // Default behavior for other text
    };

    renderer.list = function (list: Tokens.List): string {
        const type = list.ordered ? 'ol' : 'ul';
        const startAttr = list.ordered && list.start !== 1 ? ` start="${list.start}"` : '';
        return `<${type}${startAttr} class="custom-list">${list.items.map(item => this.listitem(item)).join('')}</${type}>`;
    };

    renderer.listitem = function (item: Tokens.ListItem): string {
        // Since marked.js doesn't parse inline content in list items with custom renderers,
        // we need to manually parse the text content
        let processedContent = '';
        if (item.text) {
            const sample_context = item.text;
            try {
                const level_exp = replaceForLatext(sample_context);
                // Parse the text as inline content to get proper tokenization
                const result = inlineMarked.parseInline(level_exp);
                processedContent = typeof result === 'string' ? result : level_exp;
            } catch (parseError) {
                console.log('Inline parsing failed, using raw text:', parseError);
                // Still apply escaping even if parsing fails
                processedContent = replaceForLatext(sample_context);
            }
        } else if (item.tokens && item.tokens.length > 0) {
            // If we somehow have tokens, process them
            processedContent = item.tokens.map(token => {
                console.log('Processing token:', token.type, token);
                const rendererMethod = (this as any)[token.type];
                return rendererMethod ? rendererMethod.call(this, token) : token.raw || '';
            }).join('');
        }

        return `<li class="custom-list-item">${processedContent}</li>\n`;
    };

    // Enhanced strong/bold text renderer for filename-description format
    renderer.strong = function (text: any) {
        const textContent = String(text.text || text);
        // Default strong rendering for ALL other cases (any text with **)
        return `<strong>${textContent}</strong>`;
    };

    renderer.code = function (code: any) {
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
        enableLogging: false
    });

    // Create custom renderer with access to sanitizeMermaidCode
    const customRenderer = React.useMemo(() => createCustomRenderer(sanitizeMermaidCode), [sanitizeMermaidCode]);

    // Function to process markdown with marked and custom mermaid handling
    const processMarkdown = useCallback(() => {
        try {
            if (!content.trim()) {
                return "";
            }
            // Create marked instance with custom renderer
            const markedInstance = createMarkedInstance(customRenderer);
            let renderedHtml = markedInstance.parse(content) as string;
            return renderedHtml;
        } catch (error) {
            console.error("Error processing markdown:", error);
            return `<div class="error">${error instanceof Error ? error.message : 'Unknown error'}</div>`;
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
        if (isMounted) {
            const html = processMarkdown();
            console.log('Markdown processing completed, setting processedHtml');
            setProcessedHtml(html);
        } else {
            console.log('Skipping markdown processing - component not mounted');
        }
    }, [content, processMarkdown, isMounted]);


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
            }, 100);
            return () => {
                console.log('Cleaning up timer...');
                clearTimeout(timer);
            };
        } else {
            console.log('Skipping mermaid and math processing due to missing conditions');
        }
    }, [processedHtml, renderMermaidDiagrams, isMounted, addPanZoomToChart]);

    return (
        <Card className={cn("overflow-auto", className)}>
            <div
                ref={(el) => {
                    containerRef.current = el;
                }}
                className="markdown-body mathjax-container"
                dangerouslySetInnerHTML={{ __html: processedHtml }}
            />
        </Card>
    );
} 
