

// Sample markdown with Mermaid diagram for demonstration
const SAMPLE_MARKDOWN = `# Markdown Mermaid Viewer

Welcome to the Markdown Mermaid Viewer! This tool allows you to:

### System Components
- **Consensus Layer**: Validates and orders transactions in the DAG via proof-of-stake or similar, ensuring acyclic integrity.
- **CLOB**: Off-chain or in-memory order book for matching buy/sell orders; outputs matched trades to the risk engine.
- **Risk Engine**: Processes post-match data:
  - Update user positions and compute PNL (e.g., \( \text{PNL} = (\text{current_price} - \text{entry_price}) \times \text{position_size} \)).
  - Check liquidation thresholds (e.g., if margin ratio < 1.1, trigger liquidation).
  - Portfolio management: Aggregate assets, risks, and bucket IDs (e.g., low/medium/high risk buckets).
  - Bucket ID: A categorization (e.g., hash-based or exposure-based ID) for grouping similar risk profiles.
- **DAG Network**: Transactions as vertices, dependencies as edges. Shards form sub-DAGs with cross-shard links.
- **Nodes**: Heterogeneous with sizes \\( s_i \\) (normalized, \\( \sum s_i = 1 \\)), representing capacity.

\`\`\`javascript
const highlight = "code";
\`\`\`

- Write and edit Markdown content
- Render Mermaid diagrams inside your Markdown
- Preview the rendered content in real-time
- Import and export your Markdown files

## Example Mermaid Diagram

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[Continue]
\`\`\`

## Flowchart Example

\`\`\`mermaid
flowchart LR
    A[Hard edge] -->|Link text| B(Round edge)
    B --> C{Decision}
    C -->|One| D[Result one]
    C -->|Two| E[Result two]
\`\`\`

## Sequence Diagram Example

\`\`\`mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
\`\`\`

## Class Diagram Example

\`\`\`mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        -int sizeInFeet
        -canEat()
    }
    class Zebra{
        +bool is_wild
        +run()
    }
\`\`\`
`;

export { SAMPLE_MARKDOWN };