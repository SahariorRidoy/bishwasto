import { NextResponse } from 'next/server'

export function middleware(request) {
  // Get the current path
  // const pathname = request.nextUrl.pathname
  
  // // Always allow authentication pages (login/logout) regardless of cookies
  // if (pathname.startsWith('/authentication') || pathname.startsWith('/login') || pathname === '/') {
  //   return NextResponse.next()
  // }
  
  // // Get the access token from cookies
  // const accessToken = request.cookies.get('accessToken')?.value
  
  // // If no access token, redirect to authentication
  // if (!accessToken) {
  //   return NextResponse.redirect(new URL('/authentication', request.url))
  // }
  
  // // Check if user has a pending shop request
  // const shopRequestStatus = request.cookies.get('shopRequestStatus')?.value
  
  // // If status is pending and trying to access a route that's not allowed for pending shops
  // if (shopRequestStatus === 'pending') {
  //   // Define allowed paths for users with pending shop requests
  //   const allowedPaths = ['/shop/status']
    
  //   // Check if current path starts with any of the allowed paths
  //   const isAllowedPath = allowedPaths.some(path => pathname.startsWith(path))
    
  //   // If not an allowed path, redirect to shop/status
  //   if (!isAllowedPath) {
  //     return NextResponse.redirect(new URL('/shop/status', request.url))
  //   }
  // }
  
  // return NextResponse.next()
}

// See: https://nextjs.org/docs/advanced-features/middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}