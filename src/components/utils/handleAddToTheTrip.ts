'use server'

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache";
import { v4 } from "uuid";

export const handleAddToTheTrip = async ({ tripId, userId }: { tripId: string, userId: string }) => {
    const supainsert = createServerActionClient({ cookies })
    const { error } = await supainsert.from('UserTrip').insert({ userId, tripId })
    if (error) {
        return error
    }
    revalidatePath(`/trip/${tripId}`)
}