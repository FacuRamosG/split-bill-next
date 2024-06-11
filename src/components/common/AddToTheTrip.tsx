'use client'
import { useCallback } from "react"
import { ComposeAddBillButton } from "./ComposeAddBillButton"
import { v4 } from "uuid";
import { toast } from "sonner";
import { type Database } from "@/app/types/database";
import { handleAddToTheTrip } from "../utils/handleAddToTheTrip";
import { ComposeAddToTheTrip } from "./ComposeAddToTheTrip";

export const AddToTheTrip = ({ tripId, userId }: { tripId: string, userId: string }) => {

    const handleSumit = useCallback(async () => {
        const response = await handleAddToTheTrip({ tripId, userId })
        if (response) {
            toast.error('Error al unirse al viaje')
            return
        }
        toast.success('Te uniste al viaje')
    }, [])

    return (
        <form action={handleSumit} className="text-center">
            <h1>¿Quieres unirte al viaje llamado  </h1>
            <ComposeAddToTheTrip />
        </form>
    )
}