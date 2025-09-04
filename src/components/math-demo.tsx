"use client";

import React, { useState } from "react";
import { MarkdownViewer } from "./markdown-viewer";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const mathExamples = {
  basic: `# Basic Math Examples

## Inline Math
The quadratic formula: \\( x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\)

## Display Math
The integral formula:
\\[ \\int_a^b f(x) dx = F(b) - F(a) \\]

## Fractions and Powers
\\[ \\frac{d}{dx}\\left(\\frac{x^n}{n!}\\right) = \\frac{x^{n-1}}{(n-1)!} \\]`,

  advanced: `# Advanced Math Examples

## Matrix Operations
\\[ \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} ax + by \\\\ cx + dy \\end{pmatrix} \\]

## Summation and Products
\\[ \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2} \\]

\\[ \\prod_{k=1}^{n} k = n! \\]

## Complex Equations
The Schrödinger equation:
\\[ i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t) \\]`,

  physics: `# Physics Examples

## Einstein's Mass-Energy Relation
\\[ E = mc^2 \\]

## Newton's Second Law
\\[ \\mathbf{F} = m\\mathbf{a} \\]

## Maxwell's Equations
\\[ \\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\epsilon_0} \\]

\\[ \\nabla \\times \\mathbf{B} = \\mu_0\\mathbf{J} + \\mu_0\\epsilon_0\\frac{\\partial \\mathbf{E}}{\\partial t} \\]

## Quantum Mechanics
\\[ \\Delta x \\Delta p \\geq \\frac{\\hbar}{2} \\]`,

  mixed: `# Mixed Content with Mermaid

## Math and Charts Together

Here's an inline equation: \\( v = \\frac{d}{t} \\)

And a display equation:
\\[ F = G\\frac{m_1 m_2}{r^2} \\]

## Mermaid Flowchart
\`\`\`mermaid
flowchart LR
    A[Input] --> B{Process?}
    B -->|Yes| C[Calculate]
    B -->|No| D[Skip]
    C --> E[Output]
    D --> E
\`\`\`

## More Math
The golden ratio: \\( \\phi = \\frac{1 + \\sqrt{5}}{2} \\approx 1.618 \\)

And Euler's identity:
\\[ e^{i\\pi} + 1 = 0 \\]`
};

export function MathDemo() {
  const [selectedExample, setSelectedExample] = useState("basic");

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Math Rendering Demo</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          This demo showcases the integration of mathpix-markdown-it for mathematical equations 
          and mermaid for charts, all while maintaining the existing markdown functionality.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Example Categories</CardTitle>
          <CardDescription>
            Select different types of mathematical content to see how they render
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedExample} onValueChange={setSelectedExample}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Math</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="physics">Physics</TabsTrigger>
              <TabsTrigger value="mixed">Mixed</TabsTrigger>
            </TabsList>
            
            {Object.entries(mathExamples).map(([key, content]) => (
              <TabsContent key={key} value={key} className="mt-6">
                <MarkdownViewer content={content} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            What this integration provides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Mathematical Rendering</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• LaTeX inline math with \\( \\) delimiters</li>
                <li>• Display math with \\[ \\] delimiters</li>
                <li>• High-quality SVG output</li>
                <li>• MathML support for accessibility</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Chart Support</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Mermaid diagrams with \`\`\`mermaid blocks</li>
                <li>• Interactive pan and zoom</li>
                <li>• Responsive design</li>
                <li>• Preserved from previous implementation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
