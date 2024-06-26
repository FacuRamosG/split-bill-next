'use server'

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache";
import { v4 } from "uuid";

export const handleAddBill = async ({ tripId, formData }: { tripId: string, formData: FormData }) => {
    const supainsert = createServerActionClient({ cookies })
    const id = v4()
    const billName = formData.get('billName')
    const billAmount = formData.get('billAmount')
    const paidBy = formData.get('paidBy')
    const participants = formData.getAll('participants')

    const { error } = await supainsert.from('Bill').insert({ id, name: billName, amount: billAmount, paidBy: paidBy, tripId })
    if (error) {
        console.log('Error al ingresar un nuevo gasto', error)
        return (error)
    }
    participants && participants.length > 0 && await Promise.all(participants.map(async (participant) => {
        const { error } = await supainsert.from('UserBill').insert({ billId: id, userId: participant, tripId })
        if (error) {
            console.log('Error al ingresar un nuevo gasto', error)
            return (error)
        }
    }))
    revalidatePath(`/`);
}