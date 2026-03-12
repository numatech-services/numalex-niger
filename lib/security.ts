// ============================================================
// NumaLex — Sécurité : Rate Limiting + Logger + Helpers
// ============================================================

// ─── RATE LIMITER (en mémoire — adapté pour Edge/Serverless) ───

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Nettoyage périodique (évite fuite mémoire)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt < now) rateLimitStore.delete(key);
  }
}, 60_000);

export interface RateLimitConfig {
  /** Nombre max de requêtes */
  maxRequests: number;
  /** Fenêtre en secondes */
  windowSec: number;
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  auth: { maxRequests: 5, windowSec: 60 },        // 5 tentatives / minute
  api: { maxRequests: 60, windowSec: 60 },         // 60 req / minute
  ai: { maxRequests: 10, windowSec: 60 },          // 10 requêtes IA / minute
  upload: { maxRequests: 10, windowSec: 300 },     // 10 uploads / 5 min
  search: { maxRequests: 30, windowSec: 60 },      // 30 recherches / minute
};

/**
 * Vérifie le rate limit pour une clé donnée.
 * Retourne { allowed: true } ou { allowed: false, retryAfterSec }.
 */
export function checkRateLimit(
  identifier: string,
  category: keyof typeof DEFAULT_LIMITS = 'api',
  config?: Partial<RateLimitConfig>
): { allowed: true } | { allowed: false; retryAfterSec: number } {
  
  // ⚠️ TEMPORAIRE : Désactivation du rate limit pour le test local d'Alex
  // À supprimer avant le passage en production au Niger.
  return { allowed: true };

  const cfg = { ...DEFAULT_LIMITS[category], ...config };
  const key = `${category}:${identifier}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + cfg.windowSec * 1000 });
    return { allowed: true };
  }

  if (entry.count >= cfg.maxRequests) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  entry.count++;
  return { allowed: true };
}

// ─── SERVER LOGGER (structured, JSON-compatible) ───

type LogLevel = 'info' | 'warn' | 'error' | 'security';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  userId?: string;
  cabinetId?: string;
  ip?: string;
  action?: string;
  resource?: string;
  meta?: Record<string, unknown>;
}

/**
 * Logger structuré serveur.
 * En production, les logs sont JSON pour ingestion par un service (Datadog, Loki, etc.)
 */
export function serverLog(
  level: LogLevel,
  message: string,
  ctx?: Partial<Omit<LogEntry, 'level' | 'message' | 'timestamp'>>
): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...ctx,
  };

  if (process.env.NODE_ENV === 'production') {
    // JSON structuré pour ingestion
    console.log(JSON.stringify(entry));
  } else {
    // Format lisible en dev
    const prefix = { info: 'ℹ️', warn: '⚠️', error: '❌', security: '🔒' }[level];
    console.log(`${prefix} [${level.toUpperCase()}] ${message} - security.ts:109`, ctx ?? '');
  }
}

// Shortcuts
export const log = {
  info: (msg: string, ctx?: Record<string, unknown>) => serverLog('info', msg, { meta: ctx }),
  warn: (msg: string, ctx?: Record<string, unknown>) => serverLog('warn', msg, { meta: ctx }),
  error: (msg: string, ctx?: Record<string, unknown>) => serverLog('error', msg, { meta: ctx }),
  security: (msg: string, ctx?: Partial<LogEntry>) => serverLog('security', msg, ctx),
};

// ─── SANITIZE INPUT (XSS prevention) ───

/**
 * Nettoie une chaîne pour prévenir les injections XSS basiques.
 * Ne remplace PAS une vraie lib (DOMPurify), mais couvre les cas serveur.
 */
export function sanitize(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// ─── ENV VALIDATION (runtime) ───

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${key}`);
  }
  return value;
}

export function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}