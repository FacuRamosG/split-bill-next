'use client'

import { useCallback } from "react"
import { handleDeleteBill } from "../utils/handleDeleteBill"
import { toast } from "sonner"
import { type Database } from "@/app/types/database";

type Bill = {
    amount: number;
    created_at: string;
    id: string;
    name: string;
    paidBy: string;
    tripId: string;
    users: {
        name: string | null;
    } | null;
}

export const Bills = ({ bills }: { bills: Bill[] }) => {

    const deleteBill = useCallback(async (formData: FormData) => {
        let id = formData.get('idBill')
        if (!id) return
        id = id.toString()
        const ask = confirm('¿Estás seguro de que quieres eliminar este gasto?')
        if (!ask) return
        const response = await handleDeleteBill({ billId: id })
        toast.success('Gasto eliminado')
        return response
    }, [])
    return (
        <>
            {
                bills.map((bill, index: number) => {
                    return (
                        <form key={index} action={deleteBill} className="border p-2">
                            <h2 className="textP">{bill.name}</h2>
                            <p>Total: <strong>${bill.amount}</strong></p>
                            <p>Pagado por: <strong>{bill.users?.name}</strong></p>
                            <button name="idBill" value={bill.id} className="text-red-500 font-semibold hover:text-red-900" >Eliminar</button>
                        </form>
                    )
                })
            }
        </>
    )
}   