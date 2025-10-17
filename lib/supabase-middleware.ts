import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  console.log('Middleware: Processing request for:', request.nextUrl.pathname)
  
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
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
    console.log('Middleware: Supabase client created successfully')

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('Middleware: User check result:', { 
      hasUser: !!user, 
      userId: user?.id, 
      pathname: request.nextUrl.pathname 
    })

    // Only redirect to auth if user is not authenticated and trying to access protected routes
    // Allow access to home page and public routes without authentication
    if (
      !user &&
      !request.nextUrl.pathname.startsWith('/auth') &&
      request.nextUrl.pathname !== '/' &&
      !request.nextUrl.pathname.startsWith('/learn') &&
      !request.nextUrl.pathname.startsWith('/product-search') &&
      !request.nextUrl.pathname.startsWith('/ingredient-search') &&
      !request.nextUrl.pathname.startsWith('/ingredient-chart') &&
      !request.nextUrl.pathname.startsWith('/skin-quiz')
    ) {
      console.log('Middleware: No user found, redirecting to auth')
      const url = request.nextUrl.clone()
      url.pathname = '/auth'
      return NextResponse.redirect(url)
    }

    console.log('Middleware: User authenticated or accessing public route, allowing access')

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely.

    return supabaseResponse
  } catch (error) {
    console.error('Middleware: Error in updateSession:', error)
    // Return a basic response to avoid breaking the request
    return NextResponse.next({ request })
  }
}
