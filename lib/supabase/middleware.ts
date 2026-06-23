import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Polyfill process.version for Edge Runtime (required by supabase-js)
  if (typeof process !== 'undefined' && !process.version) {
    (process as any).version = 'v20.0.0';
  }
  const nonce = crypto.randomUUID();
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://api.microlink.io https://lh3.googleusercontent.com https://pnduuwrrikfzpratfwxv.supabase.co;
    font-src 'self' data:;
    connect-src 'self' https://pnduuwrrikfzpratfwxv.supabase.co wss://pnduuwrrikfzpratfwxv.supabase.co;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  supabaseResponse.headers.set('Content-Security-Policy', cspHeader)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Melakukan pengecekan user session
  // IMPORTANT: getUser() dipanggil untuk memvalidasi token JWT ke server Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Daftar rute yang dilindungi (wajib login)
  const protectedRoutes = ['/dashboard', '/scan', '/history', '/settings', '/reports', '/search']
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // Rute autentikasi (tidak boleh diakses jika sudah login)
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  if (!user && isProtectedRoute) {
    // User tidak login tapi mencoba mengakses halaman terlindungi -> lempar ke login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    // User sudah login tapi mencoba mengakses halaman login/register -> lempar ke dashboard
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
