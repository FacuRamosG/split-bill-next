import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers"


export const ComposeDeleteBill = ({ billId, tripId }: { billId: string; tripId: string }) => {
    const deleteBill = async () => {
        'use server'
        const supadelete = createServerActionClient({ cookies })
        const { error } = await supadelete.from('Bill').delete().eq('id', billId)
        if (error) {
            console.log(error)
        }
        revalidatePath(`/trip/${tripId}`)
    }

    return (
        <button onClick={deleteBill} className="text-red-600">Eliminar</button>
    )
}