import { withAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Adiciona headers para controlar o cache apenas se não foi limpo ainda
  const cacheLimpado = request.cookies.get('cache_limpo');
  
  if (!cacheLimpado) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    // Adiciona cookie para marcar que o cache foi limpo
    response.cookies.set('cache_limpo', 'true', {
      maxAge: 365 * 24 * 60 * 60, // 1 ano
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
  } else {
    // Se o cache já foi limpo, permite cache normal
    response.headers.set('Cache-Control', 'public, max-age=31536000');
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pacotes/:path*",
    "/api/pacotes/:path*",
    "/meu-album/:path*",
    "/trocas/:path*",
    "/times/:path*"
  ]
}; 