'use server'
import { createRouteHandlerClient, createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 } from "uuid";
import { revalidatePath } from "next/cache";
import { Toaster, toast } from "sonner";
import { SplitBill } from "@/components/common/SplitBill";
import { ComposeAddBillButton } from "@/components/common/ComposeAddBillButton";
import { ComposeDeleteBill } from "@/components/common/ComposeDeleteBill";

export default async function Trip({ params: { tripId } }: { params: { tripId: string } }) {

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    const { data: isInTheTrip } = await supabase.from('UserTrip').select('*').eq('userId', session?.user.id).eq('tripId', tripId)


    const { data, error } = await supabase.from('UserTrip').select('*,users (*)').eq('tripId', tripId)

    const { data: bills } = await supabase.from('Bill').select('*, users (name)').eq('tripId', tripId)


    //arreglar esto
    let users: ({} | null)[] = []
    data && data.length > 0 && await Promise.all(data.map(async (user: any) => {
        const { data } = await supabase.from('users').select('*').eq('id', user.userId)
        users.push(data)
    }))


    const addBill = async (formData: FormData) => {
        'use server'
        const id = v4()
        const billName = formData.get('billName')
        const billAmount = formData.get('billAmount')
        const paidBy = formData.get('paidBy')
        const participants = formData.getAll('participants')
        if (participants === null || participants.length === 0) {
            console.log('You must select at least one participant')
            return
        }
        const supainsert = createServerActionClient({ cookies })


        await supainsert.from('Bill').insert({ id, name: billName, amount: billAmount, paidBy: paidBy, tripId: tripId })
        participants && participants.length > 0 && await Promise.all(participants.map(async (participant: any) => {
            const { error } = await supainsert.from('UserBill').insert({ billId: id, userId: participant, tripId })
            if (error) console.log(error)
        }))

        revalidatePath(`/trip/${tripId}`)
    }

    const handleAddToTheTrip = async () => {
        'use server'
        const supainsert = createServerActionClient({ cookies })
        const { error } = await supainsert.from('UserTrip').insert({ userId: session?.user.id, tripId })
        console.log('error', error)
        revalidatePath(`/trip/${tripId}`)
    }


    return (
        <>
            {
                session ? (
                    isInTheTrip && isInTheTrip?.length == 0 ? (
                        <form action={handleAddToTheTrip} className="text-center">
                            <h1>¿Quieres unirte al viaje de ? </h1>
                            <button className="border px-3 py-2" >Unirse al viaje</button>
                        </form>
                    ) : (
                        <>
                            <Toaster />
                            <section className="p-5 max-w-screen-lg mx-auto">
                                <form action={addBill} className="text-black min-w-full flex flex-col ">
                                    <div>
                                        <h1 className="title text-3xl">Agrega un gasto</h1>
                                        <div className="flex w-full mt-7 justify-between gap-10">
                                            <div className="w-full flex flex-col gap-4">
                                                <div>
                                                    <label htmlFor="first_name" className="block mb-2 text-lg font-medium text-gray-900 ">Nombre del gasto</label>
                                                    <input type="text" id="first_name" name="billName" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="Super.." required />
                                                </div>
                                                <div>
                                                    <label htmlFor="first_name" className="block mb-2 text-lg font-medium text-gray-900 ">Total</label>
                                                    <input type="number" id="first_name" name="billAmount" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="$3000" required />
                                                </div>
                                            </div>
                                            <div className="w-full flex flex-col gap-4">
                                                <div>
                                                    <label htmlFor="first_name" className="block text-lg font-medium text-gray-900 ">Pagado por</label>
                                                    <select name="paidBy" className="border border-gray-300 rounded-lg p-2" id="" required>
                                                        {
                                                            users.length > 0 && users.map((user: any) => {
                                                                return (
                                                                    <option className="text-black" key={user[0].id} value={user[0].id}>{user[0].name}</option>
                                                                )
                                                            })
                                                        }

                                                    </select>
                                                </div>

                                                <div>
                                                    <h1 className="text-lg font-medium text-gray-900" >Participantes</h1>
                                                    {
                                                        users.length > 0 && users.map((user: any) => {
                                                            return (
                                                                <div key={user[0].id} className="flex justify-start items-center">
                                                                    <input type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 " name="participants" value={user[0].id} />
                                                                    <label htmlFor="participants" className="ml-1">{user[0].name}</label>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <ComposeAddBillButton />

                                </form>

                                <div>
                                    <h1 className="title text-3xl">Gastos</h1>
                                    {
                                        bills && bills.length > 0 && bills.map((bill: any) => {
                                            return (
                                                <div key={bill.id} className=" shadow-lg rounded-lg p-4 mb-4">
                                                    <h2 className="textP">{bill.name}</h2>
                                                    <p>Total: <strong>${bill.amount}</strong></p>
                                                    <p>Pagado por: <strong>{bill.users.name}</strong></p>
                                                    {/* <ComposeDeleteBill billId={bill.id} tripId={tripId} /> */}
                                                </div>
                                            )
                                        })
                                    }
                                </div>

                                {/* <form action={handleSplitBill}>
                    <button className="border px-2 py-3 rounded-lg bg-blue-400 text-white hover:bg-blue-500">Calcular Rembolsos</button>
                </form> */}
                                <SplitBill tripId={tripId} />
                            </section>
                        </>

                    )
                ) : (
                    <div className="text-center">
                        <h1>Debe iniciar sesion para poder ver esta pagina</h1>
                    </div>
                )
            }

        </>
    )
}