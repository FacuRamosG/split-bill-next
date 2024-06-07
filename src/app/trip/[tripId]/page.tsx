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

export default async function Trip({ params: { tripId } }: { params: { tripId: string } }) {

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    const { data: isInTheTrip } = await supabase.from('UserTrip').select('*').eq('userId', session?.user.id).eq('tripId', tripId)

    const { data: trip } = await supabase.from('Trip').select('*,users (*)').eq('id', tripId)
    // console.log('trip', trip)


    const { data, error } = await supabase.from('UserTrip').select('*,users (*)').eq('tripId', tripId)

    const { data: bills } = await supabase.from('Bill').select('*, users (name)').eq('tripId', tripId)


    //fix this shit, get users from data
    let users: ({} | null)[] = []
    data && data.length > 0 && await Promise.all(data.map(async (user: any) => {
        const { data } = await supabase.from('users').select('*').eq('id', user.userId)
        users.push(data)
    }))


    const handleAddToTheTrip = async () => {
        'use server'
        const supainsert = createServerActionClient({ cookies })
        const { error } = await supainsert.from('UserTrip').insert({ userId: session?.user.id, tripId })
        console.log('error', error)
        revalidatePath(`/trip/${tripId}`)
    }

    const deleteBill = async (formData: FormData) => {
        'use server'
        const id = formData.get('idBill')
        const supadelete = createServerActionClient({ cookies })
        const { error } = await supadelete.from('Bill').delete().eq('id', id)
        if (error) {
            console.log(error)
        }
        revalidatePath(`/trip/${tripId}`)
    }


    return (
        <>
            {
                session ? (
                    isInTheTrip && isInTheTrip?.length == 0 ? (
                        <form action={handleAddToTheTrip} className="text-center">
                            <h1>¿Quieres unirte al viaje llamado  </h1>
                            <button className="border px-3 py-2" >Unirse al viaje</button>
                        </form>
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
                    <div className="text-center flex flex-col justify-center">
                        <img src="https://www.shutterstock.com/image-photo/cat-holding-stop-sign-isolated-600nw-567313750.jpg" alt="" />
                        <h1>Debe iniciar sesion para poder ver esta pagina</h1>
                    </div>
                )
            }

        </>
    )
}