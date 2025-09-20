import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Définir les chemins qui nécessitent une authentification
const protectedPaths = ['/profile', '/admin']; // <-- '/appointment' retiré
// Chemins spécifiques aux administrateurs
const adminPaths = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[Middleware] Request to: ${pathname}, URL: ${request.url}`);

  // Si la route est un API call ou un fichier statique, laisser passer
  if (pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico') {
    console.log(`[Middleware] Static or API route, passing through: ${pathname}`);
    return NextResponse.next();
  }

  const requiresAuth = protectedPaths.some(path => pathname.startsWith(path));

  console.log(`[Middleware] Checking access for path: ${pathname}, requiresAuth: ${requiresAuth}`);

  if (!requiresAuth) {
    console.log(`[Middleware] Path ${pathname} does not require auth, proceeding.`);
    return NextResponse.next();
  }

  console.log(`[Middleware] Checking token for ${pathname}.`);
  console.log(`[Middleware] Cookies:`, request.cookies.getAll().map(c => c.name));

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log(`[Middleware] Token found:`, token ? 'Yes' : 'No');

    // --- RESTAURATION: Rediriger si le token est absent ---
    if (!token) {
      console.log(`[Middleware] No token for protected route ${pathname}. Redirecting to /.`);
      // S'assurer que l'URL de redirection est absolue
      const loginUrl = new URL('/', request.url);
      return NextResponse.redirect(loginUrl);
    }
    // --- FIN RESTAURATION ---

    // Vérifier les autorisations d'admin si nécessaire
    const requiresAdmin = adminPaths.some(path => pathname.startsWith(path));
    if (requiresAdmin && token.role !== 'admin') {
      console.log(`[Middleware] Non-admin accessing admin route ${pathname}. Redirecting to /profile.`);
      // S'assurer que l'URL de redirection est absolue
      const profileUrl = new URL('/profile', request.url);
      return NextResponse.redirect(profileUrl);
    }

    console.log(`[Middleware] Access granted to ${pathname}.`);
    return NextResponse.next(); // Continuer si le token est valide et les droits sont suffisants

  } catch (error) {
    console.error(`[Middleware] Error checking token:`, error);
    // --- RESTAURATION: Rediriger en cas d'erreur ---
    console.log(`[Middleware] Error occurred, redirecting to /.`);
    // S'assurer que l'URL de redirection est absolue
    const errorUrl = new URL('/', request.url);
    return NextResponse.redirect(errorUrl);
    // --- FIN RESTAURATION ---
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};