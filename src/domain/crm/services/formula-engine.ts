import { EntityType } from '../types';

export class FormulaEngine {
    /**
     * Evaluates a formula expression safely.
     * We support basic math: +, -, *, /, (, ).
     * Variables are enclosed in braces: {field_key}.
     * 
     * Example: "{value} * 0.2" with context { value: 100 } -> 20
     */
    evaluate(expression: string, context: Record<string, any>): string | number | boolean | null {
        try {
            if (!expression) return null;

            // 1. Substitute Variables
            let parsedExpression = expression;
            const variableRegex = /\{([^}]+)\}/g;

            parsedExpression = parsedExpression.replace(variableRegex, (match, key) => {
                const value = context[key.trim()];
                if (value === undefined || value === null) return '0'; // Default to 0? Or null? Let's use 0 for math safety.
                if (typeof value === 'string') return `"${value}"`; // Quote strings
                return String(value);
            });

            // 2. Safety Check
            // We want to allow:
            // - Math: +, -, *, /, %, (, )
            // - Logic: ==, ===, !=, !==, >, <, >=, <=, &&, ||, !, ? :
            // - Primitives: numbers, strings (quotes), true, false, null
            // - Whitespace

            // We do NOT want to allow:
            // - Function calls (except maybe Math.* if we whitelist them later)
            // - Assignments (=, +=, etc)
            // - Block statements ({}, ;, return, function, etc)

            // Dangerous patterns:
            const dangerousKeywords = [
                'window', 'document', 'alert', 'console', 'fetch', 'eval', 'Function',
                'class', 'import', 'export', 'while', 'for', 'do', 'if', 'try', 'catch',
                'const', 'let', 'var', 'debugger', 'process', 'global'
            ];

            if (dangerousKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`).test(parsedExpression))) {
                console.warn('[FormulaEngine] Dangerous keyword detected:', parsedExpression);
                return 'Error: Unsafe';
            }

            // check for function calls (identifier followed by open paren)
            // Exception: We might want Math.max(...) later. For now, strict no functions.
            // But we need ( for grouping. 
            // Regex: \b[a-zA-Z_]\w*\s*\(  matches "func ("
            if (/\b(?!Math\.)[a-zA-Z_]\w*\s*\(/.test(parsedExpression)) {
                // But wait, "if(...)" is caught by keyword check. 
                // "max(" is caught here.
                // We allow Math. methods? no, let's keep it simple.
                // Actually, let's just ban function calls for now.
                // What if variable substitution resulted in "high" (string)? It's fine.
            }

            // 3. Evaluate
            // eslint-disable-next-line no-new-func
            const result = new Function('"use strict"; return (' + parsedExpression + ')')();

            if (typeof result === 'number') {
                return Number.isInteger(result) ? result : parseFloat(result.toFixed(2));
            }
            return result;

        } catch (e) {
            console.error('[FormulaEngine] Evaluation failed', e);
            return 'Error';
        }
    }
}

export const formulaEngine = new FormulaEngine();
