'use client'
import { useFormStatus } from "react-dom";


export const ComposeAddBillButton = () => {
    const { pending } = useFormStatus()
    return (
        <button
            disabled={pending}
            style={{ backgroundColor: pending ? 'rgb(29 78 216)' : '' }}
            className="bg-blue-600 hover:bg-blue-700 p-2 border max-w-40 mx-auto text-white rounded-lg px-4 py-2 mt-6">
            {pending ? 'Subiendo...' : 'Subir gasto'}
        </button>
    )
}