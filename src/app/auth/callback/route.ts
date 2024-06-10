
// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";

// // export const dynamic = 'force-dynamic'

// export async function GET(request: NextRequest) {


//     const requestUrl = new URL(request.url);
//     const code = requestUrl.searchParams.get('code');

//     if (code) {
//         const supabase = createRouteHandlerClient({ cookies });
//         await supabase.auth.exchangeCodeForSession(code)
//         const {
//             data: { user },
//         } = await supabase.auth.getUser()
//         let metadata = user?.user_metadata
//     }

//     return NextResponse.redirect(requestUrl.origin, { status: 302 });

// }
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type CookieOptions, createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    console.log(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'
    if (code) {
        const cookieStore = cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.delete({ name, ...options })
                    },
                },
            }
        )
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}