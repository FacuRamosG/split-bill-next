'use client'

import { useCallback, useEffect, useState } from "react"
import { handleSplitBill } from "../utils/handleSplitBill"

export const SplitBill = ({ tripId }: { tripId: string }) => {
    const [rembolsos, setRembolsos] = useState<{ from: string; to: string; amount: number; }[]>([])

    const handleClick = useCallback(async () => {
        const response = await handleSplitBill({ tripId })
        setRembolsos(response)
    }, [tripId])

    console.log(rembolsos)

    return (
        <>
            <button onClick={handleClick} className="border text-white px-3 py-2 bg-blue-500 hover:bg-blue-600">Calcular rembolsos</button>
            {
                rembolsos && rembolsos.length > 0 && rembolsos.map((rembolso, index) => {
                    return (
                        <div key={index}>
                            <p>{rembolso.from} le debe a {rembolso.to}: ${rembolso.amount}</p>
                        </div>
                    )
                })
            }
        </>
    )
}