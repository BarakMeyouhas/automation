/**
 * Parses a string template containing {{nodeId.path.to.property}} variables and
 * replaces them with the corresponding values from the nodeOutputs dictionary.
 * 
 * @param prompt The string containing double-curly-brace variables.
 * @param nodeOutputs The dictionary mapping node IDs to their execution outputs.
 * @returns The parsed string with variables replaced.
 */
export function parseTemplate(prompt: string, nodeOutputs: Record<string, any>): string {
    if (!prompt) return '';

    // Match anything inside {{ }}
    const regex = /\{\{([^}]+)\}\}/g;

    return prompt.replace(regex, (match, path) => {
        const trimmedPath = path.trim();
        const parts = trimmedPath.split('.');
        
        // The first part of the path is expected to be the node ID
        let current: any = nodeOutputs;
        
        for (const part of parts) {
            // Safe traversal: if at any point the properties don't exist, return empty string
            if (current === undefined || current === null) {
                return '';
            }
            current = current[part];
        }
        
        // If the path didn't resolve to a defined value, return empty string
        if (current === undefined || current === null) {
            return '';
        }
        
        // Stringify objects or just convert primitives to strings
        return typeof current === 'object' ? JSON.stringify(current) : String(current);
    });
}
