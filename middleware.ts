import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'; 

export function middleware(request: NextRequest) {
  // On désactive la redirection forcée vers login pour l'instant
  // pour éviter la boucle infinie pendant que tu développes
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};