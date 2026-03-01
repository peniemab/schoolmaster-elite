import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Pour l'instant, on simule une vérification de cookie
  const session = request.cookies.get('appwrite-session');

  // Si on essaie d'aller sur le dashboard sans session, retour au login
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}