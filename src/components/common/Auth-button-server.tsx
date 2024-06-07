import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { AuthButton } from "./Auth-button-client";



export async function AuthButtonServer() {


    const supabase = createRouteHandlerClient({ cookies })

    const { data: { session } } = await supabase.auth.getSession()


    return <AuthButton session={session} />
}