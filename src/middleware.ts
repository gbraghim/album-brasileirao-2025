import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isPublicRoute = request.nextUrl.pathname === '/' || 
                       request.nextUrl.pathname.startsWith('/_next') ||
                       request.nextUrl.pathname.startsWith('/static')

  // Adiciona headers de segurança
  const response = NextResponse.next()
  
  // Previne clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  // Ativa proteção XSS no navegador
  response.headers.set('X-XSS-Protection', '1; mode=block')
  // Previne MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  // Política de segurança de conteúdo
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';")
  // Força HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Se for uma rota protegida e não estiver autenticado, redireciona para login
  if (!isPublicRoute && !isApiRoute && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Se estiver autenticado e tentar acessar páginas de auth, redireciona para dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 