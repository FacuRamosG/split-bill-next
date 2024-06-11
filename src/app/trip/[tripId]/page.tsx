'use server'
import { createRouteHandlerClient, createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 } from "uuid";
import { revalidatePath } from "next/cache";
import { Toaster } from "sonner";
import { SplitBill } from "@/components/common/SplitBill";
import { ComposeAddBillButton } from "@/components/common/ComposeAddBillButton";
import { Bills } from "@/components/common/Bills";
import { AddBill } from "@/components/common/AddBill";
import { Database } from "@/app/types/database";
import { AddToTheTrip } from "@/components/common/AddToTheTrip";

export default async function Trip({ params: { tripId } }: { params: { tripId: string } }) {

    const supabase = createRouteHandlerClient<Database>({ cookies })

    const { data: { session } } = await supabase.auth.getSession()

    const { data: isInTheTrip } = await supabase.from('UserTrip').select('*').eq('userId', session?.user.id ?? '').eq('tripId', tripId)

    const { data, error } = await supabase.from('UserTrip').select('*,users (*)').eq('tripId', tripId)

    const { data: bills } = await supabase.from('Bill').select('*, users (name)').eq('tripId', tripId)


    let users: {
        avatar_url: string | null;
        id: string;
        name: string | null;
    }[] = [];

    data && data.length > 0 && await Promise.all(data.map(async (user) => {
        const { data } = await supabase.from('users').select('*').eq('id', user.userId).order('name')
        if (data) {
            users.push(data[0])
        }

    }))


    return (
        <>
            {
                session ? (
                    isInTheTrip && isInTheTrip?.length == 0 ? (
                        <AddToTheTrip tripId={tripId} userId={session.user.id} />
                    ) : (
                        <>
                            <Toaster />
                            <section className="p-5 max-w-screen-lg mx-auto">
                                <AddBill tripId={tripId} users={users} />
                                <div>
                                    <h1 className="title text-3xl">Gastos</h1>
                                    {
                                        bills && bills.length > 0 && <Bills bills={bills} />
                                    }
                                </div>

                                <SplitBill tripId={tripId} />
                            </section>
                        </>

                    )
                ) : (
                    <div className="text-center flex flex-col justify-center items-center mt-10">
                        <h1 className="title text-3xl">Debes iniciar sesion para poder ver esta pagina</h1>
                        <img src="https://www.shutterstock.com/image-photo/cat-holding-stop-sign-isolated-600nw-567313750.jpg" alt="" width={500} />
                    </div>
                )
            }

        </>
    )
}