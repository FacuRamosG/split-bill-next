'use server'

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache";

export const handleDeleteBill = async ({ billId }: { billId: string }) => {
    const supadelete = createServerActionClient({ cookies })

    const { error } = await supadelete.from('Bill').delete().eq('id', billId)
    if (error) {
        console.log('Error al eliminar el bill', error)
        return
    }

    revalidatePath(`/`)
}