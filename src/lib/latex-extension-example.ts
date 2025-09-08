/**
 * Example usage of the TypeScript LaTeX extension for marked
 * This file demonstrates how to use the updated marked-latex-support.ts
 */

import { Marked } from 'marked';
import createLatexExtension, { type LatexExtensionOptions } from './marked-latex-support';

// Example 1: Basic usage with KaTeX rendering
const basicLatexOptions: LatexExtensionOptions = {
    lazy: false,
    render: (formula: string, isBlock: boolean): string => {
        // This would typically use KaTeX or MathJax
        // For demonstration, we'll return a placeholder
        const displayMode = isBlock ? 'block' : 'inline';
        return `<span class="latex-rendered ${displayMode}">${formula}</span>`;
    }
};

// Example 2: Lazy loading with async rendering
const lazyLatexOptions: LatexExtensionOptions = {
    lazy: true,
    env: 'production',
    render: async (formula: string, isBlock: boolean): Promise<string> => {
        // Simulate async rendering (e.g., with MathJax)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const displayMode = isBlock ? 'block' : 'inline';
        return `<span class="latex-rendered ${displayMode}">${formula}</span>`;
    }
};

// Example 3: Integration with marked
export function createMarkedWithLatex(options: LatexExtensionOptions = basicLatexOptions) {
    const marked = new Marked();
    
    // Add the LaTeX extension
    marked.use(createLatexExtension(options));
    
    return marked;
}

// Example 4: Usage in a React component
export function parseMarkdownWithLatex(markdown: string, options?: LatexExtensionOptions): string {
    const marked = createMarkedWithLatex(options);
    return marked.parse(markdown) as string;
}

// Example markdown content with LaTeX
export const exampleMarkdown = `
# Mathematical Expressions

This is an inline equation: $E = mc^2$

This is a block equation:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

Another inline: $\\alpha + \\beta = \\gamma$

Another block:

$$
\\frac{d}{dx}\\left(\\int_{a}^{x} f(t) dt\\right) = f(x)
$$
`;

// Example usage:
// const html = parseMarkdownWithLatex(exampleMarkdown, basicLatexOptions);
// console.log(html);
