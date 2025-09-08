import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function replaceForLatext(sample_context: string): string {
  let level_op = "------"
  // Fixed regex to allow backslashes inside the math content
  const blockMathRegex1 = /\\\([\s\S]*?\\\)/g;
  const blockMatches1 = sample_context.match(blockMathRegex1);
  const blockMathRegex2 = /\\\[[\s\S]*?\\\]/g;
  const blockMatches2 = sample_context.match(blockMathRegex2);
  if (!blockMatches1 && !blockMatches2) {
    return sample_context;
  }

  if (blockMatches1) {
    // Convert LaTeX inline math delimiters \( \) to $ $ only if found in pairs
    level_op = sample_context.replace(blockMathRegex1, (match) => {
      // Remove the \( and \) delimiters and wrap with $ $
      const content = match.slice(2, -2); // Remove \( and \)
     // console.log('Converting inline math:', match, 'to', `$${content}$`);
      return `$${content}$`;
    });
  }
  if (blockMatches2) {
    // Convert LaTeX block math delimiters \[ \] to $$ $$ only if found in pairs
    level_op = sample_context.replace(blockMathRegex2, (match) => {
      // Remove the \[ and \] delimiters and wrap with $$ $$
      const content = match.slice(2, -2); // Remove \[ and \]
    //  console.log('Converting block math:', match, 'to', `$$${content}$$`);
      return `$$${content}$$`;
    });
  }
//  console.log('Inline parsing result:', level_op);
  return level_op
}

export function inlinePlacement(processedText: string): boolean {

  // Convert LaTeX inline math delimiters \( \) to $ $ only if found in pairs
  const inlineMathRegex = /\\\([\s\S]*?\\\)/g;
  const inlineMatches = processedText.match(inlineMathRegex);
  if (inlineMatches) {
    processedText = processedText.replace(inlineMathRegex, (match) => {
      // Remove the \( and \) delimiters and wrap with $ $
      const content = match.slice(2, -2); // Remove \( and \)
      console.log('Converting inline math:', match, 'to', `$${content}$`);
      return `$${content}$`;
    });
  }

  // Convert LaTeX block math delimiters \[ \] to $$ $$ only if found in pairs
  const blockMathRegex = /\\\[[\s\S]*?\\\]/g;
  const blockMatches = processedText.match(blockMathRegex);
  if (blockMatches) {
    processedText = processedText.replace(blockMathRegex, (match) => {
      // Remove the \[ and \] delimiters and wrap with $$ $$
      const content = match.slice(2, -2); // Remove \[ and \]
      console.log('Converting block math:', match, 'to', `$$${content}$$`);
      return `$$${content}$$`;
    });
  }

  return true;
}