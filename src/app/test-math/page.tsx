"use client";

import { SimpleLatexViewer } from "@/components/simple-latex-viewer";

const testMathContent = `# Enhanced LaTeX Rendering Test

## Original Content from Image (Testing Greek Letters)

IOTA's Tangle with on-chain voting, Nano's representative consensus, Cosmos SDK's staking-weighted governance), key axioms:

**Node Operator Roles:**
Operators (shard consensus nodes, oracle daemons, IBC variants) run binaries publicly, but participation in upgrades requires active involvement—e.g., software updates, voting, or signaling—to maintain network liveness. Without fees, incentives rely on staking rewards, not transaction costs.

**Upgrade Necessity vs. Income Risk:**
Upgrades (e.g., tokenomics from beginner \\( Y = r \\cdot B \\) fixed yields to intermediate \\( Y = r \\cdot (B/TVL) \\) dynamic APR) enhance TVL and

**Price Dynamics and Governance Axiom:**
\\( P = \\frac{D}{S \\cdot V} \\) (price via demand \\( D \\), supply \\( S \\), velocity \\( V \\)), but may dilute short-term \\( R \\) (rewards) for operators. Axiom: Governance must balance utility, with veto thresholds to prevent harmful changes.

**Participation Mechanisms:**
On-chain (staking-weighted votes) or hybrid (off-chain proposals + node signaling), per Cosmos-like IBC ecosystems. Node count \\( N \\) influences decentralization, boosting \\( D(N) = \\alpha N^\\beta \\) (demand growth with nodes).

**Concluding Axioms:**
These axioms ensure upgrades like tokenomics evolution drive long-term TVL, mitigating spam in feeless systems via improved incentives.

## Enhanced LaTeX Package Support

### Greek Letters (Lowercase)
- Alpha: \\( \\alpha \\) - Beta: \\( \\beta \\) - Gamma: \\( \\gamma \\)
- Delta: \\( \\delta \\) - Epsilon: \\( \\epsilon \\) - Zeta: \\( \\zeta \\)
- Eta: \\( \\eta \\) - Theta: \\( \\theta \\) - Iota: \\( \\iota \\)
- Kappa: \\( \\kappa \\) - Lambda: \\( \\lambda \\) - Mu: \\( \\mu \\)
- Nu: \\( \\nu \\) - Xi: \\( \\xi \\) - Pi: \\( \\pi \\)
- Rho: \\( \\rho \\) - Sigma: \\( \\sigma \\) - Tau: \\( \\tau \\)
- Upsilon: \\( \\upsilon \\) - Phi: \\( \\phi \\) - Chi: \\( \\chi \\)
- Psi: \\( \\psi \\) - Omega: \\( \\omega \\)

### Greek Letters (Uppercase)
- Gamma: \\( \\Gamma \\) - Delta: \\( \\Delta \\) - Theta: \\( \\Theta \\)
- Lambda: \\( \\Lambda \\) - Xi: \\( \\Xi \\) - Pi: \\( \\Pi \\)
- Sigma: \\( \\Sigma \\) - Phi: \\( \\Phi \\) - Psi: \\( \\Psi \\) - Omega: \\( \\Omega \\)

### Advanced Mathematical Operators

#### Fractions and Roots
- Simple fraction: \\( \\frac{a}{b} \\)
- Complex fraction: \\( \\frac{\\frac{a}{b}}{\\frac{c}{d}} \\)
- Square root: \\( \\sqrt{x} \\)
- nth root: \\( \\sqrt[n]{x} \\)
- Nested roots: \\( \\sqrt{\\sqrt{x}} \\)

#### Powers and Subscripts
- Basic power: \\( x^2 \\)
- Complex power: \\( x^{n+1} \\)
- Subscript: \\( x_i \\)
- Combined: \\( x_i^{n+1} \\)

#### Summations and Products
- Sum: \\( \\sum_{i=1}^{n} x_i \\)
- Product: \\( \\prod_{k=1}^{n} k \\)
- Double sum: \\( \\sum_{i=1}^{m} \\sum_{j=1}^{n} x_{ij} \\)

#### Integrals and Derivatives
- Definite integral: \\( \\int_a^b f(x) dx \\)
- Indefinite integral: \\( \\int f(x) dx \\)
- Double integral: \\( \\iint_D f(x,y) dx dy \\)
- Derivative: \\( \\frac{d}{dx} f(x) \\)
- Partial derivative: \\( \\frac{\\partial f}{\\partial x} \\)
- Second derivative: \\( \\frac{d^2}{dx^2} f(x) \\)

### Linear Algebra

#### Matrices
- 2x2 matrix: \\( \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\)
- 3x3 matrix: \\( \\begin{pmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{pmatrix} \\)
- Matrix multiplication: \\( \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} ax + by \\\\ cx + dy \\end{pmatrix} \\)

#### Vectors and Operators
- Vector: \\( \\vec{v} = \\begin{pmatrix} v_x \\\\ v_y \\\\ v_z \\end{pmatrix} \\)
- Dot product: \\( \\vec{a} \\cdot \\vec{b} \\)
- Cross product: \\( \\vec{a} \\times \\vec{b} \\)
- Gradient: \\( \\nabla f \\)
- Divergence: \\( \\nabla \\cdot \\vec{F} \\)
- Curl: \\( \\nabla \\times \\vec{F} \\)

### Physics and Engineering Equations

#### Classical Mechanics
- Newton's second law: \\( \\vec{F} = m\\vec{a} \\)
- Kinetic energy: \\( K = \\frac{1}{2}mv^2 \\)
- Gravitational potential: \\( U = -\\frac{GMm}{r} \\)
- Angular momentum: \\( \\vec{L} = \\vec{r} \\times \\vec{p} \\)

#### Electromagnetism
- Coulomb's law: \\( F = k\\frac{q_1 q_2}{r^2} \\)
- Electric field: \\( \\vec{E} = -\\nabla V \\)
- Maxwell's equations:
  \\[ \\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\epsilon_0} \\]
  \\[ \\nabla \\times \\vec{B} = \\mu_0\\vec{J} + \\mu_0\\epsilon_0\\frac{\\partial \\vec{E}}{\\partial t} \\]

#### Quantum Mechanics
- Schrödinger equation: \\( i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\vec{r},t) = \\hat{H}\\Psi(\\vec{r},t) \\)
- Heisenberg uncertainty: \\( \\Delta x \\Delta p \\geq \\frac{\\hbar}{2} \\)
- Wave function normalization: \\( \\int |\\Psi|^2 d^3r = 1 \\)

### Advanced Mathematical Concepts

#### Series and Sequences
- Geometric series: \\( \\sum_{n=0}^{\\infty} r^n = \\frac{1}{1-r} \\) for \\( |r| < 1 \\)
- Taylor series: \\( f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n \\)
- Fourier series: \\( f(x) = \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} [a_n\\cos(nx) + b_n\\sin(nx)] \\)

#### Complex Analysis
- Euler's formula: \\( e^{i\\theta} = \\cos\\theta + i\\sin\\theta \\)
- Euler's identity: \\( e^{i\\pi} + 1 = 0 \\)
- Cauchy-Riemann equations:
  \\[ \\frac{\\partial u}{\\partial x} = \\frac{\\partial v}{\\partial y} \\]
  \\[ \\frac{\\partial u}{\\partial y} = -\\frac{\\partial v}{\\partial x} \\]

## Mermaid Chart Test

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Process]
    B -->|No| D[End]
    C --> E[Result]
    E --> D
\`\`\`

## Mixed Content Test
Here's some text with inline math \\( E = mc^2 \\) and a display equation:

\\[ \\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6} \\]

More text continues here with another inline equation \\( \\alpha + \\beta = \\gamma \\).
`;

export default function TestMathPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Enhanced LaTeX Rendering Test</h1>
      <p className="mb-4 text-gray-600">
        This page tests the enhanced LaTeX integration with mathpix-markdown-it, 
        improved font rendering, and comprehensive math package support.
        It includes the specific content from your image to test Greek letter rendering.
      </p>
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">What&apos;s Enhanced:</h2>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• <strong>Better Font Rendering:</strong> Multiple math font families for crisp symbol display</li>
          <li>• <strong>Greek Letter Support:</strong> All lowercase and uppercase Greek letters</li>
          <li>• <strong>Advanced Math Packages:</strong> Linear algebra, calculus, physics equations</li>
          <li>• <strong>Fallback Rendering:</strong> Graceful degradation if math rendering fails</li>
          <li>• <strong>Enhanced Spacing:</strong> Better layout for complex mathematical expressions</li>
        </ul>
      </div>
      <SimpleLatexViewer content={testMathContent} />
    </div>
  );
}
