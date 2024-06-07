'use server'
import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache";
import { v4 } from "uuid";

export const handleAddTrip = async ({ tripName, created_by }: { tripName: string, created_by: string }) => {
    'use server'
    const supainsert = createServerActionClient({ cookies })
    const id = v4()
    const { error } = await supainsert.from('Trip').insert([{ id, name: tripName, created_by }])
    if (error) {
        console.log('Error al ingresar un nuevo viaje', error)
        return (error)
    }
    const { error: error2 } = await supainsert.from('UserTrip').insert([{ userId: created_by, tripId: id }])
    if (error2) {
        console.log('Error al ingresar un nuevo viaje', error2)
        return (error2)
    }
    revalidatePath(`/`)
}