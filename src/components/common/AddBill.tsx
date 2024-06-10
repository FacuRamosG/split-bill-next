'use client'
import { useCallback } from "react"
import { ComposeAddBillButton } from "./ComposeAddBillButton"
import { v4 } from "uuid";
import { handleAddBill } from "../utils/handleAddBill";
import { toast } from "sonner";


export const AddBill = ({ users, tripId }: { users: any, tripId: string }) => {

    const handingSumit = useCallback(async (formData: FormData) => {
        const participants = formData.getAll('participants')
        const billAmount = formData.get('billAmount')

        if (participants === null || participants.length === 0) {
            toast.error('Elige al menos un participante')
            return
        }
        if (billAmount === null) {
            toast.error('Agrega un monto')
            return
        }

        const amount = Number(billAmount)

        if (amount <= 0) {
            toast.error('El monto debe ser mayor a 0')
            return
        }


        const response = await handleAddBill({ tripId, formData })
        if (response) {
            toast.error('Error al agregar el gasto')
            return
        }

        toast.success('Gasto agregado')


    }, [])

    return (
        <form action={handingSumit} className="text-black min-w-full flex flex-col ">
            <div>
                <h1 className="title text-3xl">Agrega un gasto</h1>
                <div className="flex w-full mt-7 justify-between gap-10">
                    <div className="w-full flex flex-col gap-4">
                        <div>
                            <label htmlFor="first_name" className="block mb-2 text-lg font-medium text-gray-900 ">Nombre del gasto:</label>
                            <input type="text" id="first_name" name="billName" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="Super.." required />
                        </div>
                        <div>
                            <label htmlFor="first_name" className="block mb-2 text-lg font-medium text-gray-900 ">Total:</label>
                            <input type="number" id="first_name" name="billAmount" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="$3000" required />
                        </div>
                    </div>
                    <div className="w-full flex flex-col gap-4">
                        <div>
                            <label htmlFor="first_name" className="block text-lg font-medium text-gray-900 ">Pagado por:</label>
                            <select name="paidBy" className="border border-gray-300 rounded-lg p-2" id="" required>
                                {
                                    users.length > 0 && users.map((user: any) => {
                                        return (
                                            <option className="text-black p-2" key={user[0].id} value={user[0].id}>{user[0].name}</option>
                                        )
                                    })
                                }

                            </select>
                        </div>

                        <div>
                            <h1 className="text-lg font-medium text-gray-900" >Participantes:</h1>
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
    )
}