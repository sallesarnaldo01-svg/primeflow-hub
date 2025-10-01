export function renderTemplate(template: string, variables: Record<string, any>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const keys = key.trim().split('.');
    let value: any = variables;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return match;
    }
    
    return String(value ?? match);
  });
}

export function extractVariables(template: string): string[] {
  const matches = template.matchAll(/\{\{([^}]+)\}\}/g);
  return Array.from(matches).map(m => m[1].trim());
}
