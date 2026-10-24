export const REPO_URL = 'https://github.com/niklas1andonly/OpenPaintDepth';

const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapes text for use inside HTML text and attribute values. */
export const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => ENTITIES[ch]!);
