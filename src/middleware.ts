import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isPublicRoute = request.nextUrl.pathname === '/'

  // Redireciona usuários autenticados para fora das páginas de autenticação
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redireciona usuários não autenticados para a página de login
  // Exceto para páginas públicas e de autenticação
  if (!isAuthPage && !isApiRoute && !isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Adiciona headers de segurança
  const response = NextResponse.next()
  
  // Previne clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  // Ativa proteção XSS no navegador
  response.headers.set('X-XSS-Protection', '1; mode=block')
  // Previne MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  // Política de segurança de conteúdo atualizada
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data: blob:; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' http://localhost:* https://*.vercel.app; " +
    "frame-src 'self'; " +
    "worker-src 'self' blob:; " +
    "child-src 'self' blob:"
  )
  // Força HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 