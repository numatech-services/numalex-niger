// ============================================================
// NumaLex — Middleware Sécurisé (Version Corrigée)
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/client', '/superadmin'];
const AUTH_PATHS = ['/login', '/auth'];
const RATE_LIMITED_PATHS = ['/login', '/auth/callback'];

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, max = 100, windowMs = 60_000): boolean {
  const now = Date.now();
  if (rateLimitMap.size > 5000) rateLimitMap.clear();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > max;
}

function buildCSP(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://*.supabase.co",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join('; ');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';

  // 1. Rate Limiting
  if (RATE_LIMITED_PATHS.some((p) => pathname.startsWith(p)) && isRateLimited(ip)) {
    return new NextResponse('Trop de tentatives.', { status: 429 });
  }

  // 2. Initialisation Supabase (Gestion des cookies corrigée pour Next.js 14/15)
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Vérification de la session (getSession est plus stable pour le middleware)
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  // 4. Redirections Logiques
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 5. Headers de Sécurité
  const h = response.headers;
  h.set('Content-Security-Policy', buildCSP());
  h.set('X-Frame-Options', 'DENY');
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};