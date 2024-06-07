'use client'

import { useCallback, useState } from "react"
import { toast } from "sonner"
import { handleAddTrip } from "../utils/handleAddTrip"

export const AddNewTrip = ({ created_by }: { created_by: string }) => {
    const [sending, setSending] = useState(false)

    const addTrip = useCallback(async (formData: FormData) => {
        setSending(true)
        const tripName = formData.get('tripName')
        if (!tripName) {
            toast.error('El nombre del viaje es requerido')
            setSending(false)
            return
        }
        const response = await handleAddTrip({ tripName: tripName as string, created_by })
        if (response) {
            toast.error('Error al agregar el viaje')
            setSending(false)
            return
        }
        toast.success('Viaje agregado')
        setSending(false)

    }, [created_by])

    return (
        <div className="w-full flex flex-col gap-6">
            <form action={addTrip} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="trip_name" className="block mb-2 textP font-medium text-gray-900 ">Nombre del nuevo viaje</label>
                    <input type="text" id="trip_name" name="tripName" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="Perú,España,..." required />
                </div>
                <button disabled={sending} style={{ backgroundColor: sending ? 'rgb(29 78 216)' : '' }} className="bg-blue-600 hover:bg-blue-700 p-2 border text-white rounded-lg px-4 py-2">{sending ? 'Agregando...' : 'Agregar viaje'}</button>
            </form>
        </div>

    )
}