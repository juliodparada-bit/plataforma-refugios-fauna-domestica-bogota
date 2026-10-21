import type { Request } from 'express';

/** Cookie `sid` (web) o `Authorization: Bearer` (móvil). La cookie gana si hay ambas. */
export function extraerToken(req: Request): string | undefined {
  const cookie = (req.cookies as Record<string, string> | undefined)?.sid;
  if (cookie) return cookie;
  const auth = req.headers.authorization;
  if (!auth) return undefined;
  const partes = auth.trim().split(/\s+/);
  if (partes.length < 2) return undefined;
  if (partes[0].toLowerCase() !== 'bearer') return undefined;
  return partes.slice(1).join(' ') || undefined;
}
