/**
 * Safe markdown rendering utility
 *
 * Uses marked for markdown parsing and DOMPurify for HTML sanitization
 * to prevent XSS attacks from external content.
 */

import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * Converts markdown text to sanitized HTML
 *
 * @param markdown - Markdown text (potentially from untrusted source)
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export function renderMarkdown(markdown: string): string {
  // Parse markdown to HTML
  const rawHtml = marked.parse(markdown, {
    async: false,
    breaks: true,  // Convert \n to <br>
    gfm: true      // GitHub Flavored Markdown
  }) as string

  // Sanitize HTML to prevent XSS
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u',
      'ul', 'ol', 'li', 'code', 'pre', 'blockquote'
    ],
    ALLOWED_ATTR: []  // No attributes allowed for security
  })

  return cleanHtml
}
