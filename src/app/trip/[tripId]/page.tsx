'use server'
import { createRouteHandlerClient, createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 } from "uuid";
import { revalidatePath } from "next/cache";
import { Toaster, toast } from "sonner";
import { SplitBill } from "@/components/common/SplitBill";

export default async function Trip({ params: { tripId } }: { params: { tripId: string } }) {

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    const { data: isInTheTrip } = await supabase.from('UserTrip').select('*').eq('userId', session?.user.id).eq('tripId', tripId)
    console.log('isInTheTrip', isInTheTrip)

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

    const handleSplitBill = async () => {
        'use server'
        const supabase = createRouteHandlerClient({ cookies })

        const { data: users } = await supabase.from('UserTrip').select('*,users (*)').eq('tripId', tripId)

        const { data: bills } = await supabase.from('Bill').select('*, users (name)').eq('tripId', tripId)

        const { data: userBills } = await supabase.from('UserBill').select('*, users (name)').eq('tripId', tripId)


        // console.log('userBills', userBills)
        // console.log('users', users)
        // console.log('bills', bills)

        type User = {
            id: string;
            tripId: string;
            userId: string;
            users: {
                id: string;
                name: string;
                avatar_url: string;
            };
        };

        type Bill = {
            id: string;
            created_at: string;
            name: string;
            amount: number;
            paidBy: string;
            tripId: string;
            users: {
                name: string;
            };
        };

        type UserBill = {
            id: string;
            userId: string;
            billId: string;
            tripId: string;
            users: {
                name: string;
            };
        };

        // Paso 1: Organizar los datos

        const billParticipants: Record<string, string[]> = {};

        userBills?.forEach(userBill => {
            const { billId, userId } = userBill;
            if (!billParticipants[billId]) {
                billParticipants[billId] = [];
            }
            billParticipants[billId].push(userId);
        });

        // Paso 2: Calcular las deudas

        const userDebts: Record<string, Record<string, number>> = {};

        bills?.forEach(bill => {
            const participants = billParticipants[bill.id];
            const amountPerUser = bill.amount / participants.length;

            participants.forEach(userId => {
                if (userId !== bill.paidBy) {
                    if (!userDebts[userId]) {
                        userDebts[userId] = {};
                    }
                    if (!userDebts[userId][bill.paidBy]) {
                        userDebts[userId][bill.paidBy] = 0;
                    }
                    userDebts[userId][bill.paidBy] += amountPerUser;
                }
            });
        });

        // Paso 3: Consolidar deudas

        const netDebts: Record<string, number> = {};

        Object.keys(userDebts).forEach(debtor => {
            Object.keys(userDebts[debtor]).forEach(creditor => {
                const amount = userDebts[debtor][creditor];
                if (!netDebts[debtor]) netDebts[debtor] = 0;
                if (!netDebts[creditor]) netDebts[creditor] = 0;
                netDebts[debtor] -= amount;
                netDebts[creditor] += amount;
            });
        });

        const simplifiedTransactions: { from: string, to: string, amount: number }[] = [];

        const positiveBalances = Object.keys(netDebts).filter(userId => netDebts[userId] > 0);
        const negativeBalances = Object.keys(netDebts).filter(userId => netDebts[userId] < 0);

        positiveBalances.forEach(creditor => {
            negativeBalances.forEach(debtor => {
                if (netDebts[creditor] === 0 || netDebts[debtor] === 0) return;
                const amount = Math.min(netDebts[creditor], -netDebts[debtor]);
                if (amount > 0) {
                    simplifiedTransactions.push({ from: debtor, to: creditor, amount });
                    netDebts[creditor] -= amount;
                    netDebts[debtor] += amount;
                }
            });
        });

        // Paso 4: Imprimir los resultados simplificados
        simplifiedTransactions.forEach(async transaction => {
            const { data: from } = await supabase.from('users').select('name').eq('id', transaction.from)
            const { data: to } = await supabase.from('users').select('name').eq('id', transaction.to)
            if (from && to) {
                console.log(`${from[0].name} debe a ${to[0].name}: $${transaction.amount.toFixed(2)}`);
            }
        });


        return simplifiedTransactions
        // revalidatePath(`/trip/${tripId}`)
    }

    const handleAddToTheTrip = async () => {
        'use server'
        console.log('handleAddToTheTrip')
        const supainsert = createServerActionClient({ cookies })
        const { error } = await supainsert.from('UserTrip').insert({ userId: session?.user.id, tripId })
        console.log('error', error)
        revalidatePath(`/trip/${tripId}`)
    }


    return (
        <>
            {
                session ? (
                    isInTheTrip == null ? (
                        <>
                            <Toaster />
                            <section className="p-5 max-w-screen-lg mx-auto">
                                <form action={addBill} className="text-black min-w-full">
                                    <h1>Add some Bill</h1>
                                    <div className="flex w-full justify-between gap-10">
                                        <div className="w-full">
                                            <div>
                                                <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 ">Bill name</label>
                                                <input type="text" id="first_name" name="billName" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="Super.." required />
                                            </div>
                                            <div>
                                                <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 ">Amount</label>
                                                <input type="number" id="first_name" name="billAmount" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="$3000" required />
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <div>
                                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-900 ">Paid by</label>
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
                                                <h1>Participantes</h1>
                                                {
                                                    users.length > 0 && users.map((user: any) => {
                                                        return (
                                                            <div key={user[0].id}>
                                                                <input type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 " name="participants" value={user[0].id} />
                                                                <label htmlFor="participants" className="ml-1">{user[0].name}</label>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <button className="bg-blue-600 hover:bg-blue-700 p-2 border text-white rounded-lg px-4 py-2">Summit</button>

                                </form>

                                <div>
                                    <h1>Facturas</h1>
                                    {
                                        bills && bills.length > 0 && bills.map((bill: any) => {
                                            return (
                                                <div key={bill.id} className=" shadow-lg rounded-lg p-4 mb-4">
                                                    <h2 className="textP">{bill.name}</h2>
                                                    <p>Amount: {bill.amount}</p>
                                                    <p>Paid by: {bill.users.name}</p>
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
                    ) : (
                        <form action={handleAddToTheTrip} className="text-center">
                            <h1>¿Quieres unirte al viaje de ? </h1>
                            <button className="border px-3 py-2" >Unirse al viaje</button>
                        </form>

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