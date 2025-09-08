import { type MarkedExtension, type TokenizerAndRendererExtension } from 'marked';

const CLASS_NAME = 'latex-b172fea480b';

// Define the options interface for the LaTeX extension
export interface LatexExtensionOptions {
    lazy?: boolean;
    env?: string;
    render: (formula: string, isBlock: boolean) => string | Promise<string>;
}

// Define the token interfaces for LaTeX
interface LatexBlockToken {
    type: 'latex-block';
    raw: string;
    formula: string;
}

interface LatexInlineToken {
    type: 'latex';
    raw: string;
    formula: string;
}

type LatexToken = LatexBlockToken | LatexInlineToken;

// Create the block LaTeX extension
const createBlockExtension = (options: LatexExtensionOptions): TokenizerAndRendererExtension => ({
    name: 'latex-block',
    level: 'block',
    start(src: string): number | undefined {
        const match = src.match(/\$\$[^\$]/);
        return match ? match.index : undefined;
    },
    tokenizer(src: string): LatexBlockToken | undefined {
        const match = /^\$\$([^\$]+)\$\$/.exec(src);
        return match ? {
            type: 'latex-block',
            raw: match[0],
            formula: match[1]
        } : undefined;
    },
    renderer(token: LatexBlockToken): string {
        if (!options.lazy) {
            return options.render(token.formula, true);
        }
        return `<span class="${CLASS_NAME}" block>${token.formula}</span>`;
    }
});

// Create the inline LaTeX extension
const createInlineExtension = (options: LatexExtensionOptions): TokenizerAndRendererExtension => ({
    name: 'latex',
    level: 'inline',
    start(src: string): number | undefined {
        const match = src.match(/\$[^\$]/);
        return match ? match.index : undefined;
    },
    tokenizer(src: string): LatexInlineToken | undefined {
        const match = /^\$([^\$]+)\$/.exec(src);
        return match ? {
            type: 'latex',
            raw: match[0],
            formula: match[1]
        } : undefined;
    },
    renderer(token: LatexInlineToken): string {
        if (!options.lazy) {
            return options.render(token.formula, false);
        }
        return `<span class="${CLASS_NAME}">${token.formula}</span>`;
    }
});

// Global observer for lazy loading
let observer: IntersectionObserver | undefined;

/**
 * Creates a LaTeX extension for marked with proper TypeScript support
 * @param options Configuration options for the LaTeX extension
 * @returns MarkedExtension with LaTeX support
 */
export default function createLatexExtension(options: LatexExtensionOptions = {} as LatexExtensionOptions): MarkedExtension {
    // Initialize intersection observer for lazy loading if enabled
    if (options.lazy && options.env !== 'test') {
        observer = new IntersectionObserver((entries: IntersectionObserverEntry[], self: IntersectionObserver) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) {
                    continue;
                }

                const span = entry.target as HTMLSpanElement;
                self.unobserve(span);

                const isBlock = span.hasAttribute('block');
                const formula = span.innerText;

                Promise.resolve(options.render(formula, isBlock)).then((html: string) => {
                    span.innerHTML = html;
                }).catch((error: Error) => {
                    console.error('Error rendering LaTeX:', error);
                    span.innerHTML = `<span class="latex-error">Error rendering: ${formula}</span>`;
                });

                span.classList.add('latex-rendered');
            }
        }, { threshold: 1.0 });
    }

    return {
        extensions: [
            createBlockExtension(options),
            createInlineExtension(options)
        ]
    };
}

function escapeBrackets(text: string) {
    const pattern =
        /(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\\]|\\\((.*?)\\\)/g;
    return text.replace(
        pattern,
        (match, codeBlock, squareBracket, roundBracket) => {
            if (codeBlock) {
                return codeBlock;
            } else if (squareBracket) {
                return `$$${squareBracket}$$`;
            } else if (roundBracket) {
                return `$${roundBracket}$`;
            }
            return match;
        },
    );
}

// Export individual extension creators for more granular control
export { createBlockExtension, createInlineExtension };
export type { LatexExtensionOptions, LatexToken, LatexBlockToken, LatexInlineToken };