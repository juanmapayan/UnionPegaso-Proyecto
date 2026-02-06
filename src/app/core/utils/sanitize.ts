/**
 * Sanitiza texto eliminando caracteres potencialmente peligrosos
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Elimina tags HTML
    .replace(/javascript:/gi, '') // Elimina javascript:
    .replace(/on\w+=/gi, '') // Elimina event handlers
    .trim();
}

/**
 * Sanitiza un objeto recursivamente
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeText(sanitized[key] as string);
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(sanitized[key] as Record<string, unknown>);
    }
  }
  
  return sanitized;
}

/**
 * Escapa HTML para mostrar texto de forma segura
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Normaliza espacios en blanco
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Sanitiza y formatea un número de teléfono
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Sanitiza un email
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
